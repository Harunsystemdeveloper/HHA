namespace RestRoutes;

using OrchardCore.ContentManagement;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

public static class DeleteRoutes
{
    // ✅ Befintlig (behåll)
    public static void MapDeleteRoutes(this WebApplication app)
    {
        app.MapDelete("api/{contentType}/{id}", Handler);
    }

    // ✅ Ny overload (för /api-branchen via UseEndpoints)
    public static void MapDeleteRoutes(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapDelete("api/{contentType}/{id}", Handler);
    }

    private static async Task<IResult> Handler(
        string contentType,
        string id,
        [FromServices] IContentManager contentManager,
        [FromServices] YesSql.ISession session,
        HttpContext context)
    {
        try
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "DELETE", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get the existing content item
            var contentItem = await contentManager.GetAsync(id, VersionOptions.Published);

            if (contentItem == null || contentItem.ContentType != contentType)
            {
                return Results.Json(new { error = "Content item not found" }, statusCode: 404);
            }

            // Remove the content item
            await contentManager.RemoveAsync(contentItem);
            await session.SaveChangesAsync();

            return Results.Json(new
            {
                success = true,
                id = id
            }, statusCode: 200);
        }
        catch (Exception ex)
        {
            return Results.Json(new
            {
                error = ex.Message
            }, statusCode: 500);
        }
    }
}
