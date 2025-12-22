namespace RestRoutes;

public static class RestRoutesExtensions
{
  public static void MapRestRoutes(this WebApplication app)
  {
    // ✅ AUTH
    app.MapAuthEndpoints();

    // ✅ CRUD / CONTENT
    app.MapGetRoutes();
    app.MapPostRoutes();
    app.MapPutRoutes();
    app.MapDeleteRoutes();

    // ✅ Övrigt (om dessa finns i ditt projekt)
    app.MapSetupRoutes();
    app.MapSystemRoutes();

    // Om du har MediaUploadRoutes:
    // app.MapMediaUploadRoutes();
  }
}
