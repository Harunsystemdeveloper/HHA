namespace RestRoutes;

public static class SetupRoutes
{
  // ✅ Extension så app.MapSetupRoutes() kan användas
  // (behåller din struktur och logik)
  public static void MapSetupRoutes(this WebApplication app)
  {
    MapRestRoutes(app);
  }

  // ✅ Din befintliga metod (rör inte logiken)
  // Denna mappar alla dina routes + middleware för REST
  public static void MapRestRoutes(WebApplication app)
  {
    app.UseRestRoutesExceptionHandler();

    // Inject script into admin pages
    app.UseMiddleware<AdminScriptInjectorMiddleware>();

    app.MapAuthEndpoints();
    app.MapSystemRoutes();
    app.MapMediaUploadRoutes();
    app.MapGetRoutes();
    app.MapPostRoutes();
    app.MapPutRoutes();
    app.MapDeleteRoutes();
  }
}
