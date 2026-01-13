using Microsoft.AspNetCore.Http;
using OrchardCore.Logging;
using RestRoutes;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseNLogHost();

// Orchard
builder.Services.AddOrchardCms();

// ✅ FIX: krävs eftersom du kör app.UseAuthorization()
builder.Services.AddAuthorization();

// DEV cookies
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.SecurePolicy = CookieSecurePolicy.None;
    options.Cookie.SameSite = SameSiteMode.Lax;
});

// CORS (Vite / React)
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

// ❌ Ingen https-redirect i dev
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();
app.UseRouting();
app.UseCors("React");

// Auth (krävs för Orchard Users)
app.UseAuthentication();
app.UseAuthorization();


// ===============================
// ✅ API – MÅSTE ligga FÖRE ORCHARD
// ===============================

// Test
app.MapGet("/api/ping", () => Results.Ok(new { ok = true }));

// ✅ Fix: anropa extension-metoden direkt (ingen klassreferens behövs)
app.MapRestRoutes();

// JSON-404 för API (inte Orchard HTML)
app.MapFallback("/api/{**path}", (HttpContext ctx) =>
{
    ctx.Response.StatusCode = 404;
    ctx.Response.ContentType = "application/json";
    return ctx.Response.WriteAsync(
        System.Text.Json.JsonSerializer.Serialize(new
        {
            error = "API route not found",
            path = ctx.Request.Path.ToString()
        })
    );
});


// ===============================
// ✅ ORCHARD SIST – ALLTID
// ===============================
app.UseOrchardCore();

app.Run();
