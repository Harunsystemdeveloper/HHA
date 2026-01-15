using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OrchardCore.Logging;
using RestRoutes;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseNLogHost();

builder.Services.AddOrchardCms();

// ✅ FIX: undvik varningar / konstiga auth-beteenden
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();

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

// ✅ Seed roles (Customer) – fail-safe (kraschar inte appen om det misslyckas)
await app.SeedRolesAsync();

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

// ✅ Auth middleware
app.UseAuthentication();
app.UseAuthorization();

// ✅ ALLT under /api ska aldrig gå in i Orchard
app.UseWhen(ctx => ctx.Request.Path.StartsWithSegments("/api"), apiApp =>
{
    apiApp.UseRouting();
    apiApp.UseCors("React");
    apiApp.UseAuthentication();
    apiApp.UseAuthorization();

    apiApp.UseEndpoints(endpoints =>
    {
        endpoints.MapGet("/api/ping", () => Results.Ok(new { ok = true }));
        endpoints.MapRestRoutes();
    });

    // ✅ Fallback i /api-branchen
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

// ✅ Om någon /api/* ändå inte matchar: returnera JSON 404 (inte Orchard HTML)
app.MapFallback("/api/{**path}", (HttpContext ctx) =>
{
    ctx.Response.StatusCode = 404;
    return Results.Json(new { error = "API route not found", path = ctx.Request.Path.ToString() });
});

// ✅ Viktig för att endpoints ska registreras korrekt innan Orchard tar över
app.UseEndpoints(_ => { });

// ✅ Orchard sist
app.UseOrchardCore();

app.Run();
