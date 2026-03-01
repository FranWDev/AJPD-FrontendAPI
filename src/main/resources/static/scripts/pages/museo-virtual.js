document.addEventListener("DOMContentLoaded", () => {
  if (typeof pannellum === "undefined") {
    return;
  }

  pannellum.viewer("virtual-tour-viewer", {
    default: {
      firstScene: "escena-1",
      autoLoad: true,
      sceneFadeDuration: 1000
    },
    showZoomCtrl: true,
    compass: false,
    hotSpotDebug: false,
    scenes: {
      "escena-1": {
        type: "equirectangular",
        panorama: "https://pannellum.org/images/alma.jpg",
        hotSpots: [
          {
            pitch: 2,
            yaw: 120,
            type: "scene",
            text: "Ir a Escena 2",
            sceneId: "escena-2"
          },
          {
            pitch: -8,
            yaw: -15,
            type: "info",
            text: "Ejemplo: este punto solo muestra información"
          }
        ]
      },
      "escena-2": {
        type: "equirectangular",
        panorama: "https://pannellum.org/images/bma-1.jpg",
        hotSpots: [
          {
            pitch: 1,
            yaw: -55,
            type: "scene",
            text: "Volver a Escena 1",
            sceneId: "escena-1"
          }
        ]
      }
    }
  });
});
