/** @override */
export const measureDistances = function(segments, options={}) {
    const canvasSize = canvas.dimensions.size;
    const gridDistance = canvas.scene.data.gridDistance;

    return segments.map((s) => {
        let ray = s.ray;

        // Determine the total distance traveled
        let x = Math.abs(Math.ceil(ray.dx / canvasSize));
        let y = Math.abs(Math.ceil(ray.dy / canvasSize));

        return Math.hypot(x, y) * gridDistance;
    });
};