package main

import (
	// "context"
	// "fmt"

	// "github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()
	e.Use(middleware.Logger())
	
	e.Static("/", "static")

	e.GET("/", func(e echo.Context) error {
		return e.File("views/index.html")
	})

	e.Logger.Fatal(e.Start(":42069"))
}
