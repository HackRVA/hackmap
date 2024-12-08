package httprouter

import (
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"log"
	"math"
	"net/http"
	"sort"

	// "tinygo.org/x/tinyfont"
	// "tinygo.org/x/tinyfont/freemono"
	"hackmap/hackmap/store"
	"hackmap/web"
)

type RGBAWrapper struct {
	*image.RGBA
}

func (w RGBAWrapper) SetPixel(x, y int16, c color.RGBA) {
	w.Set(int(x), int(y), c)
}

func (w RGBAWrapper) Size() (int16, int16) {
	return 0, 0
}

func (w RGBAWrapper) Display() error {
	// No-op
	return nil
}

func (router *Router) drawContainers(w http.ResponseWriter, r *http.Request) {
	containerID := r.URL.Query().Get("id")
	if containerID == "" {
		http.Error(w, "Missing container ID", http.StatusBadRequest)
		return
	}

	containers, err := router.ContainerStore.Load()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error loading containers: %v", err)
		return
	}

	img, err := drawContainersImage(containers, containerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error drawing containers image: %v", err)
		return
	}

	w.Header().Set("Content-Type", "image/png")
	if err := png.Encode(w, img); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error encoding PNG: %v", err)
	}
}

func (router *Router) drawContainersWithID(w http.ResponseWriter, r *http.Request, containerID string) {
	containers, err := router.ContainerStore.Load()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error loading containers: %v", err)
		return
	}

	img, err := drawContainersImage(containers, containerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error drawing containers image: %v", err)
		return
	}

	w.Header().Set("Content-Type", "image/png")
	if err := png.Encode(w, img); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error encoding PNG: %v", err)
	}
}

func drawContainersImage(containers []store.Container, highlightID string) (image.Image, error) {
	baseImgFile, err := web.FS.Open("2026_Dabney_Floor_Plan_blank.png")
	if err != nil {
		return nil, err
	}
	defer baseImgFile.Close()

	baseImg, err := png.Decode(baseImgFile)
	if err != nil {
		return nil, err
	}

	img := image.NewRGBA(baseImg.Bounds())
	draw.Draw(img, img.Bounds(), baseImg, image.Point{}, draw.Src)

	const pixelsPerInch = 2

	highlightColor := color.RGBA{255, 0, 0, 255}
	white := color.RGBA{255, 255, 255, 255}

	for _, container := range containers {
		width := int(container.Width * pixelsPerInch)
		height := int(container.Height * pixelsPerInch)

		rect := image.Rect(
			int(container.X),
			int(container.Y),
			int(container.X)+width,
			int(container.Y)+height,
		)

		if container.ID == highlightID {
			drawRotatedRect(img, rect, container.Rotation, highlightColor)
			// drawRotatedLabel(img, container.Label, rect, container.Rotation, white)
		} else {
			drawRotatedRect(img, rect, container.Rotation, white)
			// drawRotatedLabel(img, container.Label, rect, container.Rotation, black)
		}
	}

	return img, nil
}

func drawRotatedRect(img *image.RGBA, rect image.Rectangle, angle float64, fillColor color.Color) {
	originX := float64(rect.Min.X)
	originY := float64(rect.Min.Y)

	corners := []image.Point{
		rotatePoint(float64(rect.Min.X), float64(rect.Min.Y), originX, originY, angle),
		rotatePoint(float64(rect.Max.X), float64(rect.Min.Y), originX, originY, angle),
		rotatePoint(float64(rect.Max.X), float64(rect.Max.Y), originX, originY, angle),
		rotatePoint(float64(rect.Min.X), float64(rect.Max.Y), originX, originY, angle),
	}

	drawFilledPolygon(img, corners, fillColor)

	borderColor := color.RGBA{0, 0, 0, 255}
	drawThickPolygon(img, corners, borderColor, 5)
}

func drawThickPolygon(img *image.RGBA, points []image.Point, col color.Color, thickness int) {
	for i := 0; i < len(points); i++ {
		p1 := points[i]
		p2 := points[(i+1)%len(points)]
		drawThickLine(img, p1.X, p1.Y, p2.X, p2.Y, col, thickness)
	}
}

func drawThickLine(img *image.RGBA, x1, y1, x2, y2 int, col color.Color, thickness int) {
	for i := -thickness / 2; i <= thickness/2; i++ {
		drawLine(img, x1+i, y1, x2+i, y2, col)
		drawLine(img, x1, y1+i, x2, y2+i, col)
	}
}

func rotatePoint(x, y, originX, originY, angle float64) image.Point {
	rad := angle * math.Pi / 180
	cos := math.Cos(rad)
	sin := math.Sin(rad)

	dx := x - originX
	dy := y - originY

	rotatedX := originX + dx*cos - dy*sin
	rotatedY := originY + dx*sin + dy*cos

	return image.Point{X: int(rotatedX), Y: int(rotatedY)}
}

func drawFilledPolygon(img *image.RGBA, points []image.Point, col color.Color) {
	minY := points[0].Y
	maxY := points[0].Y
	for _, p := range points {
		if p.Y < minY {
			minY = p.Y
		}
		if p.Y > maxY {
			maxY = p.Y
		}
	}

	for y := minY; y <= maxY; y++ {
		intersections := []int{}
		for i := 0; i < len(points); i++ {
			p1 := points[i]
			p2 := points[(i+1)%len(points)]
			if (p1.Y <= y && p2.Y > y) || (p1.Y > y && p2.Y <= y) {
				x := p1.X + (y-p1.Y)*(p2.X-p1.X)/(p2.Y-p1.Y)
				intersections = append(intersections, x)
			}
		}
		sort.Ints(intersections)
		for i := 0; i < len(intersections); i += 2 {
			if i+1 < len(intersections) {
				drawLine(img, intersections[i], y, intersections[i+1], y, col)
			}
		}
	}
}

func drawPolygon(img *image.RGBA, points []image.Point, col color.Color) {
	for i := 0; i < len(points); i++ {
		p1 := points[i]
		p2 := points[(i+1)%len(points)]
		drawLine(img, p1.X, p1.Y, p2.X, p2.Y, col)
	}
}

func drawLine(img *image.RGBA, x1, y1, x2, y2 int, col color.Color) {
	dx := math.Abs(float64(x2 - x1))
	dy := math.Abs(float64(y2 - y1))
	sx := -1
	if x1 < x2 {
		sx = 1
	}
	sy := -1
	if y1 < y2 {
		sy = 1
	}
	err := dx - dy

	for {
		img.Set(x1, y1, col)
		if x1 == x2 && y1 == y2 {
			break
		}
		e2 := 2 * err
		if e2 > -dy {
			err -= dy
			x1 += sx
		}
		if e2 < dx {
			err += dx
			y1 += sy
		}
	}
}
