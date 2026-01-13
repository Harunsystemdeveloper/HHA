global using Dyndata;
global using static Dyndata.Factory;

namespace RestRoutes;

using OrchardCore.ContentManagement;
using OrchardCore.ContentManagement.Records;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using YesSql.Services;
using System.Text.Json;
using System.Text.RegularExpressions;

public static partial class GetRoutes
{
    // ✅ Din befintliga metod (oförändrad)
    public static void MapGetRoutes(this WebApplication app)
    {
        // Get single item by ID (with population)
        app.MapGet("api/expand/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            var cleanObjects = await FetchCleanContent(contentType, session, populate: true);

            var item = cleanObjects.FirstOrDefault(obj => obj.ContainsKey("id") && obj["id"]?.ToString() == id);

            if (item == null)
            {
                context.Response.StatusCode = 404;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("null");
                return Results.Empty;
            }

            return Results.Json(item);
        });

        // Get all items with population (with optional filters)
        app.MapGet("api/expand/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            var cleanObjects = await FetchCleanContent(contentType, session, populate: true);

            var filteredData = ApplyQueryFilters(context.Request.Query, cleanObjects);

            return Results.Json(filteredData);
        });

        // Get single item by ID (without population)
        app.MapGet("api/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            var cleanObjects = await FetchCleanContent(contentType, session, populate: false);

            var item = cleanObjects.FirstOrDefault(obj => obj.ContainsKey("id") && obj["id"]?.ToString() == id);

            if (item == null)
            {
                context.Response.StatusCode = 404;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("null");
                return Results.Empty;
            }

            return Results.Json(item);
        });

        // Get all items without population (with optional filters)
        app.MapGet("api/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            var cleanObjects = await FetchCleanContent(contentType, session, populate: false);

            var filteredData = ApplyQueryFilters(context.Request.Query, cleanObjects);

            return Results.Json(filteredData);
        });

        // Get single raw item by ID (no cleanup, no population)
        app.MapGet("api/raw/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            var rawObjects = await FetchRawContent(contentType, session);

            var item = rawObjects.FirstOrDefault(obj =>
                obj.ContainsKey("ContentItemId") && obj["ContentItemId"]?.ToString() == id);

            if (item == null)
            {
                context.Response.StatusCode = 404;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("null");
                return Results.Empty;
            }

            return Results.Json(item);
        });

        // Get all raw items (no cleanup, no population, but with filters)
        app.MapGet("api/raw/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            var rawObjects = await FetchRawContent(contentType, session);

            var filteredData = ApplyQueryFilters(context.Request.Query, rawObjects);

            return Results.Json(filteredData);
        });
    }

    // ✅ NY overload (vi tar inte bort något)
    public static void MapGetRoutes(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("api/expand/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            var cleanObjects = await FetchCleanContent(contentType, session, populate: true);

            var item = cleanObjects.FirstOrDefault(obj => obj.ContainsKey("id") && obj["id"]?.ToString() == id);

            if (item == null)
            {
                context.Response.StatusCode = 404;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("null");
                return Results.Empty;
            }

            return Results.Json(item);
        });

        endpoints.MapGet("api/expand/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            var cleanObjects = await FetchCleanContent(contentType, session, populate: true);

            var filteredData = ApplyQueryFilters(context.Request.Query, cleanObjects);

            return Results.Json(filteredData);
        });

        endpoints.MapGet("api/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            var cleanObjects = await FetchCleanContent(contentType, session, populate: false);

            var item = cleanObjects.FirstOrDefault(obj => obj.ContainsKey("id") && obj["id"]?.ToString() == id);

            if (item == null)
            {
                context.Response.StatusCode = 404;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("null");
                return Results.Empty;
            }

            return Results.Json(item);
        });

        endpoints.MapGet("api/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            var cleanObjects = await FetchCleanContent(contentType, session, populate: false);

            var filteredData = ApplyQueryFilters(context.Request.Query, cleanObjects);

            return Results.Json(filteredData);
        });

        endpoints.MapGet("api/raw/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            var rawObjects = await FetchRawContent(contentType, session);

            var item = rawObjects.FirstOrDefault(obj =>
                obj.ContainsKey("ContentItemId") && obj["ContentItemId"]?.ToString() == id);

            if (item == null)
            {
                context.Response.StatusCode = 404;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("null");
                return Results.Empty;
            }

            return Results.Json(item);
        });

        endpoints.MapGet("api/raw/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            var rawObjects = await FetchRawContent(contentType, session);

            var filteredData = ApplyQueryFilters(context.Request.Query, rawObjects);

            return Results.Json(filteredData);
        });
    }
}
