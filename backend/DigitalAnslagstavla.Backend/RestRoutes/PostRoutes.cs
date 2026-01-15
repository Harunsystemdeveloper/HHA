namespace RestRoutes;

using OrchardCore.ContentManagement;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using System.Text.Json;
using Newtonsoft.Json.Linq;

public static class PostRoutes
{
    private static readonly HashSet<string> RESERVED_FIELDS = new(StringComparer.OrdinalIgnoreCase)
    {
        "id",
        "contentItemId",
        "title",
        "displayText",
        "owner",
        "author",
        "createdUtc",
        "modifiedUtc",
        "publishedUtc",
        "contentType",
        "published",
        "latest"
    };

    // ✅ Din befintliga metod (uppdaterad men inte borttagen)
    public static void MapPostRoutes(this WebApplication app)
    {
        app.MapPost("api/{contentType}", async (
            string contentType,
            [FromBody] Dictionary<string, object>? body,
            [FromServices] IContentManager contentManager,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            try
            {
                // Check permissions
                var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "POST", context, session);
                if (permissionCheck != null) return permissionCheck;

                // Check if body is null or empty
                if (body == null || body.Count == 0)
                {
                    return Results.Json(new { error = "Cannot read request body" }, statusCode: 400);
                }

                // Validate fields (med fallback om schema/clean output är för snäv)
                var validFields = await FieldValidator.GetValidFieldsAsync(contentType, contentManager, session);

                // ✅ Fallback: vissa content types returnerar bara "id/title" i clean output
                // Då kan vi INTE använda det som schema.
                if (LooksLikeBrokenSchema(validFields))
                {
                    validFields = body.Keys.ToHashSet(StringComparer.OrdinalIgnoreCase);
                }

                var (isValid, invalidFields) = FieldValidator.ValidateFields(body, validFields, RESERVED_FIELDS);

                if (!isValid)
                {
                    return Results.Json(new
                    {
                        error = "Invalid fields provided",
                        invalidFields = invalidFields,
                        validFields = validFields.OrderBy(f => f).ToList()
                    }, statusCode: 400);
                }

                var contentItem = await contentManager.NewAsync(contentType);

                // title -> DisplayText
                contentItem.DisplayText = body.ContainsKey("title")
                    ? body["title"]?.ToString()
                    : "Untitled";

                contentItem.Owner = context.User?.Identity?.Name ?? "anonymous";
                contentItem.Author = contentItem.Owner;

                // ✅ säkerställ att contentType-part finns (för att undvika null när vi skriver fält)
                if (contentItem.Content[contentType] == null)
                {
                    contentItem.Content[contentType] = new JObject();
                }

                // Build content directly into the content item
                foreach (var kvp in body)
                {
                    if (RESERVED_FIELDS.Contains(kvp.Key))
                        continue;

                    var pascalKey = ToPascalCase(kvp.Key);
                    var value = kvp.Value;

                    // ✅ SPECIAL: klienten skickar "html" -> Orchard HtmlBodyPart.Html
                    if (kvp.Key.Equals("html", StringComparison.OrdinalIgnoreCase))
                    {
                        string? htmlValue = value switch
                        {
                            JsonElement je when je.ValueKind == JsonValueKind.String => je.GetString(),
                            _ => value?.ToString()
                        };

                        if (!string.IsNullOrWhiteSpace(htmlValue))
                        {
                            contentItem.Content["HtmlBodyPart"] = new JObject
                            {
                                ["Html"] = htmlValue
                            };
                        }

                        continue;
                    }

                    // Handle "items" field - BagPart
                    if (kvp.Key.Equals("items", StringComparison.OrdinalIgnoreCase) &&
                        value is JsonElement itemsElement &&
                        itemsElement.ValueKind == JsonValueKind.Array)
                    {
                        var bagItems = new JArray();
                        foreach (var item in itemsElement.EnumerateArray())
                        {
                            if (item.ValueKind != JsonValueKind.Object) continue;

                            string? itemType = null;
                            if (item.TryGetProperty("contentType", out var ctProp) && ctProp.ValueKind == JsonValueKind.String)
                                itemType = ctProp.GetString();

                            if (!string.IsNullOrEmpty(itemType))
                            {
                                var bagItem = CreateBagPartItem(item, itemType);
                                bagItems.Add(bagItem);
                            }
                        }

                        if (bagItems.Count > 0)
                        {
                            contentItem.Content["BagPart"] = new JObject
                            {
                                ["ContentItems"] = bagItems
                            };
                        }
                        continue;
                    }

                    // Handle fields ending with "Id" - content item references
                    if (kvp.Key.EndsWith("Id", StringComparison.OrdinalIgnoreCase) && kvp.Key.Length > 2)
                    {
                        var fieldName = pascalKey.Substring(0, pascalKey.Length - 2);
                        var idValue = value is JsonElement jsonEl && jsonEl.ValueKind == JsonValueKind.String
                            ? jsonEl.GetString()
                            : value?.ToString();

                        if (!string.IsNullOrWhiteSpace(idValue))
                        {
                            contentItem.Content[contentType]![fieldName] = contentItem.Content[contentType]![fieldName] ?? new JObject();
                            contentItem.Content[contentType]![fieldName]!["ContentItemIds"] = new List<string> { idValue };
                        }

                        continue;
                    }

                    // JsonElement handling
                    if (value is JsonElement jsonElement)
                    {
                        if (jsonElement.ValueKind == JsonValueKind.String)
                        {
                            var str = jsonElement.GetString();

                            // ✅ HtmlField-liknande fält: skriv till "Html" istället för "Text"
                            if (IsLikelyHtmlField(kvp.Key, pascalKey))
                            {
                                contentItem.Content[contentType]![pascalKey] = contentItem.Content[contentType]![pascalKey] ?? new JObject();
                                contentItem.Content[contentType]![pascalKey]!["Html"] = str;
                            }
                            else
                            {
                                contentItem.Content[contentType]![pascalKey] = contentItem.Content[contentType]![pascalKey] ?? new JObject();
                                contentItem.Content[contentType]![pascalKey]!["Text"] = str;
                            }
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.Number)
                        {
                            contentItem.Content[contentType]![pascalKey] = contentItem.Content[contentType]![pascalKey] ?? new JObject();
                            contentItem.Content[contentType]![pascalKey]!["Value"] = jsonElement.GetDouble();
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.True || jsonElement.ValueKind == JsonValueKind.False)
                        {
                            contentItem.Content[contentType]![pascalKey] = contentItem.Content[contentType]![pascalKey] ?? new JObject();
                            contentItem.Content[contentType]![pascalKey]!["Value"] = jsonElement.GetBoolean();
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.Object)
                        {
                            var obj = new JObject();
                            foreach (var prop in jsonElement.EnumerateObject())
                            {
                                obj[ToPascalCase(prop.Name)] = ConvertJsonElementToPascal(prop.Value);
                            }
                            contentItem.Content[contentType]![pascalKey] = obj;
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.Array)
                        {
                            var arrayData = new List<string>();
                            foreach (var item in jsonElement.EnumerateArray())
                            {
                                if (item.ValueKind == JsonValueKind.String)
                                {
                                    var s = item.GetString();
                                    if (!string.IsNullOrWhiteSpace(s)) arrayData.Add(s);
                                }
                            }

                            var isContentItemIds = arrayData.Count > 0 &&
                                arrayData.All(id => id.Length > 20 && id.All(c => char.IsLetterOrDigit(c)));

                            contentItem.Content[contentType]![pascalKey] = contentItem.Content[contentType]![pascalKey] ?? new JObject();
                            if (isContentItemIds)
                                contentItem.Content[contentType]![pascalKey]!["ContentItemIds"] = arrayData;
                            else
                                contentItem.Content[contentType]![pascalKey]!["Values"] = arrayData;
                        }
                        else
                        {
                            contentItem.Content[contentType]![pascalKey] = ConvertJsonElement(jsonElement);
                        }

                        continue;
                    }

                    // Plain CLR types
                    if (value is string strValue)
                    {
                        contentItem.Content[contentType]![pascalKey] = contentItem.Content[contentType]![pascalKey] ?? new JObject();
                        if (IsLikelyHtmlField(kvp.Key, pascalKey))
                            contentItem.Content[contentType]![pascalKey]!["Html"] = strValue;
                        else
                            contentItem.Content[contentType]![pascalKey]!["Text"] = strValue;

                        continue;
                    }

                    if (value is int or long or double or float or decimal)
                    {
                        contentItem.Content[contentType]![pascalKey] = new JObject
                        {
                            ["Value"] = JToken.FromObject(value)
                        };
                        continue;
                    }

                    // Fallback
                    contentItem.Content[contentType]![pascalKey] = JToken.FromObject(value);
                }

                await contentManager.CreateAsync(contentItem, VersionOptions.Published);
                await session.SaveChangesAsync();

                return Results.Json(new
                {
                    id = contentItem.ContentItemId,
                    title = contentItem.DisplayText
                }, statusCode: 201);
            }
            catch (Exception ex)
            {
                return Results.Json(new { error = ex.Message }, statusCode: 500);
            }
        });
    }

    // ✅ NY overload (uppdaterad men inte borttagen)
    public static void MapPostRoutes(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("api/{contentType}", async (
            string contentType,
            [FromBody] Dictionary<string, object>? body,
            [FromServices] IContentManager contentManager,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            try
            {
                var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "POST", context, session);
                if (permissionCheck != null) return permissionCheck;

                if (body == null || body.Count == 0)
                {
                    return Results.Json(new { error = "Cannot read request body" }, statusCode: 400);
                }

                var validFields = await FieldValidator.GetValidFieldsAsync(contentType, contentManager, session);

                if (LooksLikeBrokenSchema(validFields))
                {
                    validFields = body.Keys.ToHashSet(StringComparer.OrdinalIgnoreCase);
                }

                var (isValid, invalidFields) = FieldValidator.ValidateFields(body, validFields, RESERVED_FIELDS);

                if (!isValid)
                {
                    return Results.Json(new
                    {
                        error = "Invalid fields provided",
                        invalidFields = invalidFields,
                        validFields = validFields.OrderBy(f => f).ToList()
                    }, statusCode: 400);
                }

                var contentItem = await contentManager.NewAsync(contentType);

                contentItem.DisplayText = body.ContainsKey("title")
                    ? body["title"]?.ToString()
                    : "Untitled";

                contentItem.Owner = context.User?.Identity?.Name ?? "anonymous";
                contentItem.Author = contentItem.Owner;

                if (contentItem.Content[contentType] == null)
                {
                    contentItem.Content[contentType] = new JObject();
                }

                foreach (var kvp in body)
                {
                    if (RESERVED_FIELDS.Contains(kvp.Key))
                        continue;

                    var pascalKey = ToPascalCase(kvp.Key);
                    var value = kvp.Value;

                    if (kvp.Key.Equals("html", StringComparison.OrdinalIgnoreCase))
                    {
                        string? htmlValue = value switch
                        {
                            JsonElement je when je.ValueKind == JsonValueKind.String => je.GetString(),
                            _ => value?.ToString()
                        };

                        if (!string.IsNullOrWhiteSpace(htmlValue))
                        {
                            contentItem.Content["HtmlBodyPart"] = new JObject
                            {
                                ["Html"] = htmlValue
                            };
                        }

                        continue;
                    }

                    if (kvp.Key.Equals("items", StringComparison.OrdinalIgnoreCase) &&
                        value is JsonElement itemsElement &&
                        itemsElement.ValueKind == JsonValueKind.Array)
                    {
                        var bagItems = new JArray();
                        foreach (var item in itemsElement.EnumerateArray())
                        {
                            if (item.ValueKind != JsonValueKind.Object) continue;

                            string? itemType = null;
                            if (item.TryGetProperty("contentType", out var ctProp) && ctProp.ValueKind == JsonValueKind.String)
                                itemType = ctProp.GetString();

                            if (!string.IsNullOrEmpty(itemType))
                            {
                                var bagItem = CreateBagPartItem(item, itemType);
                                bagItems.Add(bagItem);
                            }
                        }

                        if (bagItems.Count > 0)
                        {
                            contentItem.Content["BagPart"] = new JObject
                            {
                                ["ContentItems"] = bagItems
                            };
                        }
                        continue;
                    }

                    if (kvp.Key.EndsWith("Id", StringComparison.OrdinalIgnoreCase) && kvp.Key.Length > 2)
                    {
                        var fieldName = pascalKey.Substring(0, pascalKey.Length - 2);
                        var idValue = value is JsonElement jsonEl && jsonEl.ValueKind == JsonValueKind.String
                            ? jsonEl.GetString()
                            : value?.ToString();

                        if (!string.IsNullOrWhiteSpace(idValue))
                        {
                            contentItem.Content[contentType]![fieldName] = contentItem.Content[contentType]![fieldName] ?? new JObject();
                            contentItem.Content[contentType]![fieldName]!["ContentItemIds"] = new List<string> { idValue };
                        }

                        continue;
                    }

                    if (value is JsonElement jsonElement)
                    {
                        if (jsonElement.ValueKind == JsonValueKind.String)
                        {
                            var str = jsonElement.GetString();

                            contentItem.Content[contentType]![pascalKey] = contentItem.Content[contentType]![pascalKey] ?? new JObject();
                            if (IsLikelyHtmlField(kvp.Key, pascalKey))
                                contentItem.Content[contentType]![pascalKey]!["Html"] = str;
                            else
                                contentItem.Content[contentType]![pascalKey]!["Text"] = str;
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.Number)
                        {
                            contentItem.Content[contentType]![pascalKey] = contentItem.Content[contentType]![pascalKey] ?? new JObject();
                            contentItem.Content[contentType]![pascalKey]!["Value"] = jsonElement.GetDouble();
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.True || jsonElement.ValueKind == JsonValueKind.False)
                        {
                            contentItem.Content[contentType]![pascalKey] = contentItem.Content[contentType]![pascalKey] ?? new JObject();
                            contentItem.Content[contentType]![pascalKey]!["Value"] = jsonElement.GetBoolean();
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.Object)
                        {
                            var obj = new JObject();
                            foreach (var prop in jsonElement.EnumerateObject())
                            {
                                obj[ToPascalCase(prop.Name)] = ConvertJsonElementToPascal(prop.Value);
                            }
                            contentItem.Content[contentType]![pascalKey] = obj;
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.Array)
                        {
                            var arrayData = new List<string>();
                            foreach (var item in jsonElement.EnumerateArray())
                            {
                                if (item.ValueKind == JsonValueKind.String)
                                {
                                    var s = item.GetString();
                                    if (!string.IsNullOrWhiteSpace(s)) arrayData.Add(s);
                                }
                            }

                            var isContentItemIds = arrayData.Count > 0 &&
                                arrayData.All(id => id.Length > 20 && id.All(c => char.IsLetterOrDigit(c)));

                            contentItem.Content[contentType]![pascalKey] = contentItem.Content[contentType]![pascalKey] ?? new JObject();
                            if (isContentItemIds)
                                contentItem.Content[contentType]![pascalKey]!["ContentItemIds"] = arrayData;
                            else
                                contentItem.Content[contentType]![pascalKey]!["Values"] = arrayData;
                        }
                        else
                        {
                            contentItem.Content[contentType]![pascalKey] = ConvertJsonElement(jsonElement);
                        }

                        continue;
                    }

                    if (value is string strValue)
                    {
                        contentItem.Content[contentType]![pascalKey] = contentItem.Content[contentType]![pascalKey] ?? new JObject();
                        if (IsLikelyHtmlField(kvp.Key, pascalKey))
                            contentItem.Content[contentType]![pascalKey]!["Html"] = strValue;
                        else
                            contentItem.Content[contentType]![pascalKey]!["Text"] = strValue;

                        continue;
                    }

                    if (value is int or long or double or float or decimal)
                    {
                        contentItem.Content[contentType]![pascalKey] = new JObject
                        {
                            ["Value"] = JToken.FromObject(value)
                        };
                        continue;
                    }

                    contentItem.Content[contentType]![pascalKey] = JToken.FromObject(value);
                }

                await contentManager.CreateAsync(contentItem, VersionOptions.Published);
                await session.SaveChangesAsync();

                return Results.Json(new { id = contentItem.ContentItemId, title = contentItem.DisplayText }, statusCode: 201);
            }
            catch (Exception ex)
            {
                return Results.Json(new { error = ex.Message }, statusCode: 500);
            }
        });
    }

    private static bool LooksLikeBrokenSchema(HashSet<string> validFields)
    {
        if (validFields == null || validFields.Count == 0) return true;

        var knownOk = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "id", "title", "displayText" };
        var nonOkCount = validFields.Count(f => !knownOk.Contains(f));

        return nonOkCount == 0;
    }

    private static bool IsLikelyHtmlField(string originalKey, string pascalKey)
    {
        return originalKey.Equals("html", StringComparison.OrdinalIgnoreCase)
            || originalKey.EndsWith("html", StringComparison.OrdinalIgnoreCase)
            || pascalKey.Equals("Html", StringComparison.OrdinalIgnoreCase)
            || pascalKey.EndsWith("Html", StringComparison.OrdinalIgnoreCase);
    }

    private static string ToPascalCase(string str)
    {
        if (string.IsNullOrEmpty(str) || char.IsUpper(str[0]))
            return str;
        return char.ToUpper(str[0]) + str.Substring(1);
    }

    private static JToken ConvertJsonElement(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return new JObject { ["Text"] = element.GetString() };
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return new JObject { ["Value"] = element.GetDouble() };
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return new JObject { ["Value"] = element.GetBoolean() };
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var arrayValues = new JArray();
            foreach (var item in element.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.String)
                    arrayValues.Add(item.GetString());
                else if (item.ValueKind == JsonValueKind.Number)
                    arrayValues.Add(item.GetDouble());
                else if (item.ValueKind == JsonValueKind.True || item.ValueKind == JsonValueKind.False)
                    arrayValues.Add(item.GetBoolean());
                else
                    arrayValues.Add(JToken.Parse(item.GetRawText()));
            }
            return new JObject { ["values"] = arrayValues };
        }

        return new JObject { ["Text"] = element.ToString() };
    }

    private static JToken ConvertJsonElementToPascal(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return JToken.FromObject(element.GetString()!);
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return JToken.FromObject(element.GetDouble());
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return JToken.FromObject(element.GetBoolean());
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var arr = new JArray();
            foreach (var item in element.EnumerateArray())
            {
                arr.Add(ConvertJsonElementToPascal(item));
            }
            return arr;
        }
        else if (element.ValueKind == JsonValueKind.Object)
        {
            var obj = new JObject();
            foreach (var prop in element.EnumerateObject())
            {
                obj[ToPascalCase(prop.Name)] = ConvertJsonElementToPascal(prop.Value);
            }
            return obj;
        }

        return JToken.Parse(element.GetRawText());
    }

    private static JObject CreateBagPartItem(JsonElement itemElement, string contentType)
    {
        var bagItem = new JObject
        {
            ["ContentType"] = contentType,
            [contentType] = new JObject()
        };

        var typeSection = (JObject)bagItem[contentType]!;

        foreach (var prop in itemElement.EnumerateObject())
        {
            if (prop.Name == "contentType" || prop.Name == "id" || prop.Name == "title")
                continue;

            var pascalKey = ToPascalCase(prop.Name);
            var value = prop.Value;

            if (prop.Name.EndsWith("Id", StringComparison.OrdinalIgnoreCase) && prop.Name.Length > 2)
            {
                var fieldName = pascalKey.Substring(0, pascalKey.Length - 2);
                if (value.ValueKind == JsonValueKind.String)
                {
                    var idValue = value.GetString();
                    if (idValue != null)
                    {
                        typeSection[fieldName] = new JObject
                        {
                            ["ContentItemIds"] = new JArray(idValue)
                        };
                    }
                }
            }
            else if (value.ValueKind == JsonValueKind.String)
            {
                if (IsLikelyHtmlField(prop.Name, pascalKey))
                    typeSection[pascalKey] = new JObject { ["Html"] = value.GetString() };
                else
                    typeSection[pascalKey] = new JObject { ["Text"] = value.GetString() };
            }
            else if (value.ValueKind == JsonValueKind.Number)
            {
                typeSection[pascalKey] = new JObject { ["Value"] = value.GetDouble() };
            }
            else if (value.ValueKind == JsonValueKind.True || value.ValueKind == JsonValueKind.False)
            {
                typeSection[pascalKey] = new JObject { ["Value"] = value.GetBoolean() };
            }
            else if (value.ValueKind == JsonValueKind.Array)
            {
                var arrayData = new JArray();
                foreach (var item in value.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.String)
                    {
                        arrayData.Add(item.GetString());
                    }
                }
                typeSection[pascalKey] = new JObject { ["Values"] = arrayData };
            }
            else if (value.ValueKind == JsonValueKind.Object)
            {
                var obj = new JObject();
                foreach (var nestedProp in value.EnumerateObject())
                {
                    obj[ToPascalCase(nestedProp.Name)] = ConvertJsonElementToPascal(nestedProp.Value);
                }
                typeSection[pascalKey] = obj;
            }
        }

        return bagItem;
    }
}
