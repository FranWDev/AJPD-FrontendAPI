document.addEventListener("DOMContentLoaded", () => {
  if (typeof PhotoSphereViewer === "undefined") {
    console.error("PhotoSphereViewer is not defined");
    return;
  }

  const scenes = {
    foto1: {
      panorama: 'https://franwdev.github.io/ajpd-bucket/foto1.jpg',
      markers: [
        {
          id: 'go-to-foto2',
          position: { yaw: 0.905812728750259, pitch: -0.07536300878088431 },
          html: '<div class="custom-node"><i class="fas fa-chevron-up"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        },
        {
          id: 'go-to-foto9-from-1',
          position: { yaw: 4.814570640881161, pitch: -0.029767981780029373 },
          html: '<div class="custom-node"><i class="fas fa-chevron-up"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        }
      ]
    },
    foto2: {
      panorama: 'https://franwdev.github.io/ajpd-bucket/foto2.jpeg',
      markers: [
        {
          id: 'go-to-foto1',
          position: { yaw: 3.2204623345969474, pitch: -0.09609842948091618 },
          html: '<div class="custom-node"><i class="fas fa-chevron-down"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        },
        {
          id: 'go-to-foto3',
          position: { yaw: 1.514671347422523, pitch: -0.099137863690967 },
          html: '<div class="custom-node"><i class="fas fa-chevron-up"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        }
      ]
    },
    foto3: {
      panorama: 'https://franwdev.github.io/ajpd-bucket/foto3.jpg',
      markers: [
        {
          id: 'go-to-foto2-back',
          position: { yaw: 0.8099914110164383, pitch: -0.04261090004580903 },
          html: '<div class="custom-node"><i class="fas fa-chevron-down"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        },
        {
          id: 'go-to-foto3_5',
          position: { yaw: 5.026245443845333, pitch: -0.11590144176111394 },
          html: '<div class="custom-node"><i class="fas fa-chevron-up"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        },
        {
          id: 'go-to-foto4',
          position: { yaw: 3.9768732153248374, pitch: -0.018479731764566854 },
          html: '<div class="custom-node"><i class="fas fa-chevron-up"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        }
      ]
    },
    foto3_5: {
      panorama: 'https://franwdev.github.io/ajpd-bucket/foto3.5.jpeg',
      markers: [
        {
          id: 'go-to-foto3-back',
          position: { yaw: 5.959440743337396, pitch: -0.14052773981475597 },
          html: '<div class="custom-node"><i class="fas fa-chevron-down"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        },
        {
          id: 'go-to-foto4-from-3_5',
          position: { yaw: 1.5794468821549572, pitch: -0.023029857983252633 },
          html: '<div class="custom-node"><i class="fas fa-chevron-up"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        }
      ]
    },
    foto4: {
      panorama: 'https://franwdev.github.io/ajpd-bucket/foto4.jpg',
      markers: [
        {
          id: 'go-to-foto3-back-from-4',
          position: { yaw: 4.775146174609519, pitch: -0.057487831339254836 },
          html: '<div class="custom-node"><i class="fas fa-chevron-down"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        },
        {
          id: 'go-to-foto5',
          position: { yaw: 2.8557962061743645, pitch: -0.023303479262013482 },
          html: '<div class="custom-node"><i class="fas fa-chevron-up"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        }
      ]
    },
    foto5: {
      panorama: 'https://franwdev.github.io/ajpd-bucket/foto5.jpg',
      markers: [
        {
          id: 'go-to-foto4-back',
          position: { yaw: 6.272305091749958, pitch: -0.06677654549157253 },
          html: '<div class="custom-node"><i class="fas fa-chevron-down"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        },
        {
          id: 'go-to-foto6',
          position: { yaw: 3.509851227088176, pitch: -0.04866692125577887 },
          html: '<div class="custom-node"><i class="fas fa-chevron-up"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        }
      ]
    },
    foto6: {
      panorama: 'https://franwdev.github.io/ajpd-bucket/foto6.jpg',
      markers: [
        {
          id: 'go-to-foto5-back',
          position: { yaw: 0.5645877201359504, pitch: -0.10210493174218538 },
          html: '<div class="custom-node"><i class="fas fa-chevron-down"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        },
        {
          id: 'go-to-foto7',
          position: { yaw: 4.390531234764458, pitch: -0.032661953691563994 },
          html: '<div class="custom-node"><i class="fas fa-chevron-up"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        }
      ]
    },
    foto7: {
      panorama: 'https://franwdev.github.io/ajpd-bucket/foto7.jpg',
      markers: [
        {
          id: 'go-to-foto6-back',
          position: { yaw: 5.9064724543938345, pitch: -0.07949462440553301 },
          html: '<div class="custom-node"><i class="fas fa-chevron-down"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        },
        {
          id: 'go-to-foto8',
          position: { yaw: 2.959612496588241, pitch: -0.05823233229864089 },
          html: '<div class="custom-node"><i class="fas fa-chevron-up"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        },
        {
          id: 'go-to-foto9-from-7',
          position: { yaw: 4.10446148595622, pitch: -0.020872851260424374 },
          html: '<div class="custom-node"><i class="fas fa-chevron-up"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        }
      ]
    },
    foto8: {
      panorama: 'https://franwdev.github.io/ajpd-bucket/foto8.jpg',
      markers: [
        {
          id: 'go-to-foto7-back-from-8',
          position: { yaw: 0.8972227179886234, pitch: -0.07509285720609071 },
          html: '<div class="custom-node"><i class="fas fa-chevron-down"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        },
        {
          id: 'go-to-foto9-from-8',
          position: { yaw: 6.0871154534816885, pitch: -0.08149203773237135 },
          html: '<div class="custom-node"><i class="fas fa-chevron-up"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        }
      ]
    },
    foto9: {
      panorama: 'https://franwdev.github.io/ajpd-bucket/foto9.jpg',
      markers: [
        {
          id: 'go-to-foto8-back',
          position: { yaw: 1.34059540110191, pitch: -0.023812359372378467 },
          html: '<div class="custom-node"><i class="fas fa-chevron-down"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        },
        {
          id: 'go-to-foto7-back-from-9',
          position: { yaw: 0.49847463029493305, pitch: -0.02839074947492315 },
          html: '<div class="custom-node"><i class="fas fa-chevron-left"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        },
        {
          id: 'go-to-foto1-shortcut',
          position: { yaw: 4.402070996904035, pitch: -0.07934050212277088 },
          html: '<div class="custom-node"><i class="fas fa-home"></i></div>',
          size: { width: 32, height: 32 },
          anchor: 'center center'
        }
      ]
    }
  };

  const markerMapping = {
    'go-to-foto1': 'foto1',
    'go-to-foto1-shortcut': 'foto1',
    'go-to-foto2': 'foto2',
    'go-to-foto2-back': 'foto2',
    'go-to-foto3': 'foto3',
    'go-to-foto3-back': 'foto3',
    'go-to-foto3-back-from-4': 'foto3',
    'go-to-foto3_5': 'foto3_5',
    'go-to-foto4': 'foto4',
    'go-to-foto4-back': 'foto4',
    'go-to-foto4-from-3_5': 'foto4',
    'go-to-foto5': 'foto5',
    'go-to-foto5-back': 'foto5',
    'go-to-foto6': 'foto6',
    'go-to-foto6-back': 'foto6',
    'go-to-foto7': 'foto7',
    'go-to-foto7-back-from-8': 'foto7',
    'go-to-foto7-back-from-9': 'foto7',
    'go-to-foto8': 'foto8',
    'go-to-foto8-back': 'foto8',
    'go-to-foto9-from-1': 'foto9',
    'go-to-foto9-from-7': 'foto9',
    'go-to-foto9-from-8': 'foto9',
  };

  const viewer = new PhotoSphereViewer.Viewer({
    container: document.querySelector('#virtual-tour-viewer'),
    panorama: scenes.foto1.panorama,
    loadingTxt: 'Cargando...',
    defaultZoomLvl: 0,
    plugins: [
      [PhotoSphereViewer.MarkersPlugin, {
        markers: scenes.foto1.markers
      }]
    ]
  });

  const markersPlugin = viewer.getPlugin(PhotoSphereViewer.MarkersPlugin);

  markersPlugin.addEventListener('select-marker', ({ marker }) => {
    const commonOptions = {
      position: viewer.getPosition(),
      zoom: viewer.getZoomLevel(),
    };

    const targetSceneKey = markerMapping[marker.id];
    if (targetSceneKey && scenes[targetSceneKey]) {
      viewer.setPanorama(scenes[targetSceneKey].panorama, commonOptions).then(() => {
        markersPlugin.setMarkers(scenes[targetSceneKey].markers);
      });
    }
  });

  viewer.addEventListener('click', ({ data }) => {
    console.log(`yaw: ${data.yaw}, pitch: ${data.pitch}`);
  });
});
