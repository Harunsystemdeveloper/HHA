using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OrchardCore.Logging;
using RestRoutes;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseNLogHost();

builder.Services.AddOrchardCms();

// ✅ DEV cookies
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.SecurePolicy = CookieSecurePolicy.None;
    options.Cookie.SameSite = SameSiteMode.Lax;
});

// ✅ CORS för Vite (cookies)
builder.Services.AddCors(options =>
{
    options.AddPolicy("React", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// ✅ Kör INTE https-redirection i dev (för att slippa 307 + certstrul)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();

app.UseRouting();
app.UseCors("React");

// ✅ Lägg till auth-middleware (Orchard registrerar tjänsterna, men pipelinen behövs här också)
app.UseAuthentication();
app.UseAuthorization();

// ✅ 1) API branch: ALLT som börjar med /api ska ALDRIG gå in i Orchard
app.UseWhen(ctx => ctx.Request.Path.StartsWithSegments("/api"), apiApp =>
{
    apiApp.UseRouting();
    apiApp.UseCors("React");
    apiApp.UseAuthentication();
    apiApp.UseAuthorization();

    // ✅ Här mappar vi ALLA endpoints i /api-branchen
    apiApp.UseEndpoints(endpoints =>
    {
        // ✅ Test-endpoint
        endpoints.MapGet("/api/ping", () => Results.Ok(new { ok = true }));

        // ✅ Mappar dina REST-routes (auth + CRUD) via IEndpointRouteBuilder
        endpoints.MapRestRoutes();
    });

    // ✅ Fallback i /api-branchen (MÅSTE ligga EFTER UseEndpoints)
    apiApp.Run(async context =>
    {
        context.Response.StatusCode = 404;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(
            System.Text.Json.JsonSerializer.Serialize(new
            {
                error = "API route not found (caught before Orchard)",
                path = context.Request.Path.ToString()
            })
        );
    });
});

// ✅ MapRestRoutes utanför branchen får finnas kvar (för safety), men behövs inte längre
app.MapRestRoutes();

// ✅ Om någon /api/* inte matchar: returnera JSON 404 (inte Orchard HTML)
app.MapFallback("/api/{**path}", (HttpContext ctx) =>
{
    ctx.Response.StatusCode = 404;
    return Results.Json(new { error = "API route not found", path = ctx.Request.Path.ToString() });
});

// ✅ VIKTIGASTE RADEN: kör registrerade endpoints innan Orchard tar över
app.UseEndpoints(_ => { });

// ✅ Orchard sist
app.UseOrchardCore();

app.Run();
