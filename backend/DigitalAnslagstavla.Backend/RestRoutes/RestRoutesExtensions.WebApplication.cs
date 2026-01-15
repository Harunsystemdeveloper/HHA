namespace RestRoutes;

using Microsoft.AspNetCore.Builder;

public static class RestRoutesExtensions
{
  // ✅ app.MapRestRoutes()
  // OBS: Vi tar bort endpoints-varianten helt för att undvika att routes hamnar utanför Orchard-scope
  public static void MapRestRoutes(this WebApplication app)
  {
    // Middleware (json errors + admin script injection)
    app.MapSetupRoutesMiddleware();

    // Auth + system + media
    app.MapAuthEndpoints();
    app.MapSystemRoutes();
    app.MapMediaUploadRoutes();

    // Content CRUD
    app.MapGetRoutes();
    app.MapPostRoutes();
    app.MapPutRoutes();
    app.MapDeleteRoutes();
  }
}
