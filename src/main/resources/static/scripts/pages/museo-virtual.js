document.addEventListener("DOMContentLoaded", () => {
  let logoClicks = 0;
  let secretModeEnabled = localStorage.getItem('secretModeActive') === 'true';
  let currentClickData = null;
  let capturedPlants = JSON.parse(localStorage.getItem('capturedPlants') || '[]');

  const logo = document.querySelector('.museo-logo');
  const viewerContainer = document.querySelector('#virtual-tour-viewer');
  const modal = document.getElementById('plant-capture-modal');
  const modalInput = document.getElementById('plant-name-input');
  const capturedPlantsSection = document.getElementById('captured-plants-section');
  const capturedPlantsList = document.getElementById('captured-plants-list');

  const featureWrapper = document.getElementById('museum-feature-wrapper');
  const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
  const tutorial = document.getElementById('secret-mode-tutorial');

  // Evitar que el visor capture eventos de scroll/táctiles al interactuar con los paneles
  [capturedPlantsSection, modal].forEach(el => {
    if (el) {
      el.addEventListener('wheel', e => e.stopPropagation());
      el.addEventListener('touchmove', e => e.stopPropagation());
      el.addEventListener('touchstart', e => e.stopPropagation());
      el.addEventListener('touchend', e => e.stopPropagation());
      el.addEventListener('pointerdown', e => e.stopPropagation());
      el.addEventListener('mousedown', e => e.stopPropagation());
    }
  });

  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Evitar que el visor capture el clic
      capturedPlantsSection.classList.toggle('minimized');
    });
  }

  const toggleSecretMode = (forceState = null) => {
    secretModeEnabled = forceState !== null ? forceState : !secretModeEnabled;
    localStorage.setItem('secretModeActive', secretModeEnabled.toString());

    if (secretModeEnabled) {
      capturedPlantsSection.style.setProperty('display', 'flex', 'important');
      if (tutorial) tutorial.classList.add('show');
      
      if (logo) {
        logo.classList.remove('flash-error');
        logo.classList.add('flash-success');
        setTimeout(() => logo.classList.remove('flash-success'), 1000);
      }
    } else {
      capturedPlantsSection.style.setProperty('display', 'none', 'important');
      if (tutorial) tutorial.classList.remove('show');
      
      if (logo) {
        logo.classList.remove('flash-success');
        logo.classList.add('flash-error');
        setTimeout(() => logo.classList.remove('flash-error'), 1000);
      }
    }
    
    // Attempt to sync visibility if PSV is loaded
    if (typeof updateSidebarVisibility === 'function') {
      updateSidebarVisibility();
    }
    renderCapturedPlants();
  };

  const openCaptureModal = (data) => {
    currentClickData = data;
    const { yaw, pitch } = data;
    const coordsEl = document.getElementById('click-coords');
    if (coordsEl) coordsEl.textContent = `${yaw.toFixed(4)}, ${pitch.toFixed(4)}`;
    
    modal.classList.add('show');
    modalInput.value = '';
    setTimeout(() => modalInput.focus(), 50);
  };

  const savePlant = () => {
    const input = document.getElementById('plant-name-input');
    const name = (input ? input.value : modalInput.value).trim() || "Planta desconocida";
    
    // Obtener la escena actual
    const currentPanorama = viewer.config.panorama;
    const sceneId = Object.keys(scenes).find(key => scenes[key].panorama === currentPanorama) || 'foto1';

    const newPlant = {
      id: Date.now(),
      name: name,
      yaw: currentClickData.yaw,
      pitch: currentClickData.pitch,
      zoom: viewer.getZoomLevel(),
      sceneId: sceneId
    };

    capturedPlants.unshift(newPlant);
    localStorage.setItem('capturedPlants', JSON.stringify(capturedPlants));
    renderCapturedPlants();
    closeModal();
  };

  const closeModal = () => {
    modal.classList.remove('show');
  };

  const deletePlant = (id, btnElement) => {
    if (btnElement) {
        const card = btnElement.closest('.plant-card');
        if (card) {
            card.classList.add('fade-out');
            setTimeout(() => {
                capturedPlants = capturedPlants.filter(p => p.id !== id);
                localStorage.setItem('capturedPlants', JSON.stringify(capturedPlants));
                renderCapturedPlants();
            }, 280);
            return;
        }
    }
    capturedPlants = capturedPlants.filter(p => p.id !== id);
    localStorage.setItem('capturedPlants', JSON.stringify(capturedPlants));
    renderCapturedPlants();
  };

  const renderCapturedPlants = () => {
    if (capturedPlants.length === 0) {
      capturedPlantsList.innerHTML = '<p class="empty-list-msg">Doble clic para identificar.</p>';
      return;
    }

    capturedPlantsList.innerHTML = '';
    capturedPlants.forEach((plant, index) => {
      const card = document.createElement('div');
      card.className = 'plant-card';
      card.dataset.sceneId = plant.sceneId;
      card.dataset.yaw = plant.yaw;
      card.dataset.pitch = plant.pitch;
      if (plant.zoom) card.dataset.zoom = plant.zoom;
      
      card.style.animationDelay = `${Math.min(index * 0.05, 0.5)}s`;
      
      card.innerHTML = `
        <div class="plant-card-info">
          <h4>${plant.name}</h4>
          <p><i class="fas fa-map-marker-alt"></i> ${plant.yaw.toFixed(3)}, ${plant.pitch.toFixed(3)}</p>
        </div>
        <button class="delete-plant-btn" data-id="${plant.id}">
          <i class="fas fa-trash"></i>
        </button>
      `;
      capturedPlantsList.appendChild(card);
    });

    // Listeners para teletransporte
    capturedPlantsList.querySelectorAll('.plant-card').forEach(card => {
      card.onclick = (e) => {
        if (e.target.closest('.delete-plant-btn')) return;
        
        const sceneId = card.dataset.sceneId;
        const position = {
          yaw: parseFloat(card.dataset.yaw),
          pitch: parseFloat(card.dataset.pitch)
        };
        const zoomLevel = card.dataset.zoom ? parseFloat(card.dataset.zoom) : viewer.getZoomLevel();

        if (scenes[sceneId]) {
          viewer.setPanorama(scenes[sceneId].panorama, { position: position, zoom: zoomLevel }).then(() => {
             markersPlugin.setMarkers(scenes[sceneId].markers);
          });
        }
      };
    });

    // Listeners para borrar
    capturedPlantsList.querySelectorAll('.delete-plant-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        deletePlant(Number(btn.dataset.id), btn);
      };
    });
  };

  const exportToTxt = () => {
    if (capturedPlants.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    let content = "LISTA DE PLANTAS SELECCIONADAS - MUSEO VIRTUAL AJPD\n";
    content += "====================================================\n\n";
    capturedPlants.forEach((plant, index) => {
      content += `${index + 1}. ${plant.name}\n`;
      content += `   Imagen: ${plant.sceneId || 'Desconocida'}\n`;
      content += `   Coordenadas: Yaw: ${plant.yaw}, Pitch: ${plant.pitch}\n`;
      content += `----------------------------------------------------\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantas-museo-virtual-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Initial Event Listeners ---
  if (logo) {
    logo.addEventListener('click', () => {
      logoClicks++;
      if (logoClicks >= 5) {
        toggleSecretMode();
        logoClicks = 0; // Reset counter after toggle
      }

      // Small visual hint of registering clicks (optional small shake or filter)
      logo.style.transform = 'scale(0.95)';
      setTimeout(() => logo.style.transform = 'none', 100);
    });
  }

  document.getElementById('save-plant-btn').onclick = savePlant;
  
  const closeBtn = document.getElementById('close-modal-btn');
  closeBtn.onclick = closeModal;
  closeBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    closeModal();
  }, { passive: false });

  document.getElementById('export-txt-btn').onclick = exportToTxt;
  
  modalInput.onkeydown = (e) => {
    if (e.key === 'Enter') savePlant();
  };

  window.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Sincronizar estado inicial
  if (secretModeEnabled) {
    capturedPlantsSection.style.setProperty('display', 'flex', 'important');
    if (tutorial) tutorial.classList.add('show');
    renderCapturedPlants();
  } else {
    capturedPlantsSection.style.setProperty('display', 'none', 'important');
  }

  // Inicialización de PhotoSphereViewer
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

  // Re-insertar capas sobre el visor para que persistan en pantalla completa
  setTimeout(() => {
    const psvInternal = viewer.container.querySelector('.psv-container') || viewer.container;
    psvInternal.appendChild(capturedPlantsSection);
    psvInternal.appendChild(modal);
    updateSidebarVisibility();
  }, 100);

  const updateSidebarVisibility = () => {
    if (secretModeEnabled) {
      capturedPlantsSection.style.setProperty('display', 'flex', 'important');
    } else {
      capturedPlantsSection.style.setProperty('display', 'none', 'important');
    }
  };

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

  viewer.addEventListener('dblclick', ({ data }) => {
    if (secretModeEnabled) {
      openCaptureModal(data);
    }
  });

  // Gestionar barra lateral en pantalla completa
  viewer.addEventListener('fullscreen-updated', (e) => {
    updateSidebarVisibility();
  });
});
