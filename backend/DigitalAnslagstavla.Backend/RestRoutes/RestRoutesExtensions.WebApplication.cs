namespace RestRoutes;

using Microsoft.AspNetCore.Builder;

public static class RestRoutesExtensions
{
  // ✅ Gör så att Program.cs kan kalla app.MapRestRoutes()
  public static void MapRestRoutes(this WebApplication app)
  {
    // ✅ Middleware (för JSON errors + admin script injection)
    app.MapSetupRoutesMiddleware();

    // ✅ Content CRUD
    app.MapGetRoutes();
    app.MapPostRoutes();
    app.MapPutRoutes();
    app.MapDeleteRoutes();

    // ✅ Auth + system + media
    app.MapAuthEndpoints();
    app.MapSystemRoutes();
    app.MapMediaUploadRoutes();
  }
}
