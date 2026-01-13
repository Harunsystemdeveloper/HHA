namespace RestRoutes;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

public static class SetupRoutesExtensions
{
    // ✅ Samma innehåll som innan – bara nytt namn för att undvika krock
    public static void MapSetupRoutesMiddleware(this WebApplication app)
    {
        app.UseRestRoutesExceptionHandler();

        // Inject script into admin pages
        app.UseMiddleware<AdminScriptInjectorMiddleware>();
    }

    // ✅ No-op (middleware kan inte läggas via endpoints)
    public static void MapSetupRoutesMiddleware(this IEndpointRouteBuilder endpoints)
    {
        // no-op
    }
}
