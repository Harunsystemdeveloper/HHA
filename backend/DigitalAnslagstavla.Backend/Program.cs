using Microsoft.AspNetCore.Http;
using OrchardCore.Logging;
using RestRoutes;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseNLogHost();

builder.Services.AddOrchardCms();

// ✅ FIX: endast AddAuthorization behövs här
// (Orchard sätter upp sin auth, vi behöver bara policies/authorization när vi kör app.UseAuthorization())
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

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// ✅ Kör INTE https-redirection i dev
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();

app.UseRouting();
app.UseCors("React");

// ✅ Auth middleware (Orchard registrerar auth-scheman, men pipelinen behövs här)
app.UseAuthentication();
app.UseAuthorization();

// ✅ Test-endpoint (ska funka direkt)
app.MapGet("/api/ping", () => Results.Ok(new { ok = true }));

// ✅ Mappar ALLA dina REST routes (GET/POST/PUT/DELETE + auth + media + system)
app.MapRestRoutes();

// ✅ Om någon /api/* inte matchar: returnera JSON 404 (inte Orchard HTML)
app.MapFallback("/api/{**path}", (HttpContext ctx) =>
{
    ctx.Response.StatusCode = 404;
    return Results.Json(new { error = "API route not found", path = ctx.Request.Path.ToString() });
});

// ✅ Orchard sist (VIKTIGT!)
app.UseOrchardCore();

app.Run();
