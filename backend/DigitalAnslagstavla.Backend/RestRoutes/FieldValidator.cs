namespace RestRoutes;

using OrchardCore.ContentManagement;
using System.Text.Json.Nodes;

public static class FieldValidator
{
    public static async Task<HashSet<string>> GetValidFieldsAsync(
        string contentType,
        IContentManager contentManager,
        YesSql.ISession session)
    {
        // ✅ 1) Försök ta schema direkt från Orchard (utan att skapa temp-item i DB)
        var valid = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "title"
        };

        var schemaItem = await contentManager.NewAsync(contentType);

        // schemaItem.Content är en JsonNode (ofta JsonObject). Vi guardar allt för att slippa CS8602.
        if (schemaItem.Content is JsonObject root)
        {
            // Innehållet under contentType (t.ex. HtmlDashboardWidget: { TitlePart:..., HtmlBodyPart:... })
            if (root[contentType] is JsonObject typeObj)
            {
                foreach (var kv in typeObj)
                {
                    valid.Add(kv.Key);
                }
            }

            // ✅ HtmlBodyPart -> vi vill tillåta att klienten skickar "html"
            // (Du använder "html" i API:t, men Orchard kallar delen HtmlBodyPart)
            if (root["HtmlBodyPart"] is not null)
            {
                valid.Add("html");
            }
        }

        // Om vi fick mer än bara title så är vi klara
        if (valid.Count > 1)
            return valid;

        // -----------------------------
        // ✅ 2) Fallback: din gamla logik (behålls)
        // -----------------------------

        var cleanObjects = await GetRoutes.FetchCleanContent(contentType, session, populate: false);

        if (cleanObjects.Any())
        {
            return cleanObjects.First().Keys.ToHashSet(StringComparer.OrdinalIgnoreCase);
        }

        var tempItem = await contentManager.NewAsync(contentType);
        tempItem.DisplayText = "_temp_schema_item";

        await contentManager.CreateAsync(tempItem, VersionOptions.Published);
        await session.SaveChangesAsync();

        cleanObjects = await GetRoutes.FetchCleanContent(contentType, session, populate: false);
        var validFields = cleanObjects.First().Keys.ToHashSet(StringComparer.OrdinalIgnoreCase);

        await contentManager.RemoveAsync(tempItem);
        await session.SaveChangesAsync();

        return validFields;
    }

    public static (bool isValid, List<string> invalidFields) ValidateFields(
        Dictionary<string, object> body,
        HashSet<string> validFields,
        HashSet<string> reservedFields)
    {
        var invalidFields = body.Keys
            .Where(key => !reservedFields.Contains(key) && !validFields.Contains(key))
            .ToList();

        return (invalidFields.Count == 0, invalidFields);
    }
}
