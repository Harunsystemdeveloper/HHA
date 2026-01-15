namespace RestRoutes;

using Microsoft.AspNetCore.Builder;

public static class SetupRoutesExtensions
{
    // ✅ Middleware ska bara vara på app (inte endpoints)
    public static void MapSetupRoutesMiddleware(this WebApplication app)
    {
        app.UseRestRoutesExceptionHandler();

        // Inject script into admin pages
        app.UseMiddleware<AdminScriptInjectorMiddleware>();
    }
}
