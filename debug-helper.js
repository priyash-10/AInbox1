// Add this file to your backend folder

// Debug helper to log all registered routes
export function logRoutes(app) {
    console.log("\n🔍 REGISTERED ROUTES:")
  
    // Get the Express router stack
    const routes = []
  
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        // Routes registered directly on the app
        routes.push({
          path: middleware.route.path,
          method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        })
      } else if (middleware.name === "router") {
        // Router middleware
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            routes.push({
              path: handler.route.path,
              method: Object.keys(handler.route.methods)[0].toUpperCase(),
            })
          }
        })
      }
    })
  
    // Sort and print routes
    routes.sort((a, b) => a.path.localeCompare(b.path))
    routes.forEach((route) => {
      console.log(`${route.method.padEnd(7)} ${route.path}`)
    })
    console.log("")
  }
  
  // Debug helper to test route matching
  export function testRouteMatching(app, path) {
    console.log(`\n🔍 TESTING ROUTE MATCHING FOR: ${path}`)
  
    let matchFound = false
  
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        // Direct route
        const match =
          middleware.route.path === path ||
          (middleware.route.path.includes(":") &&
            new RegExp("^" + middleware.route.path.replace(/:[^/]+/g, "[^/]+") + "$").test(path))
  
        if (match) {
          matchFound = true
          console.log(`✅ MATCH: ${Object.keys(middleware.route.methods)[0].toUpperCase()} ${middleware.route.path}`)
        }
      } else if (middleware.name === "router") {
        // Router middleware
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            const match =
              handler.route.path === path ||
              (handler.route.path.includes(":") &&
                new RegExp("^" + handler.route.path.replace(/:[^/]+/g, "[^/]+") + "$").test(path))
  
            if (match) {
              matchFound = true
              console.log(`✅ MATCH: ${Object.keys(handler.route.methods)[0].toUpperCase()} ${handler.route.path}`)
            }
          }
        })
      }
    })
  
    if (!matchFound) {
      console.log(`❌ NO MATCH FOUND FOR: ${path}`)
    }
  
    console.log("")
  }
  