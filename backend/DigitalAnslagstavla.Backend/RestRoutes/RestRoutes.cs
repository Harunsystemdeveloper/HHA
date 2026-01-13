namespace RestRoutes;

public static class SetupRoutes
{
  // ✅ NYTT: Extension så app.MapSetupRoutes() funkar igen
  public static void MapSetupRoutes(this WebApplication app)
  {
    // vi återanvänder din befintliga metod
    MapRestRoutes(app);
  }

  // ✅ Din befintliga metod (rör inte logiken)
  // OBS: Inte en extension längre (för att undvika krock med RestRoutesExtensions.MapRestRoutes)
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
