import * as THREE from 'three';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

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
  const audioPlayerEl = document.getElementById('museum-audio-player');

  // Evitar que el visor capture eventos de scroll/táctiles al interactuar con los paneles
  [capturedPlantsSection, modal, audioPlayerEl].forEach(el => {
    if (el) {
      el.addEventListener('wheel', e => e.stopPropagation());
      el.addEventListener('touchmove', e => e.stopPropagation());
      el.addEventListener('touchstart', e => e.stopPropagation());
      el.addEventListener('touchend', e => e.stopPropagation());
      el.addEventListener('pointerdown', e => e.stopPropagation());
      el.addEventListener('mousedown', e => e.stopPropagation());
    }
  });

  // --- Configuración e Integración de Audioguías ---
  const plantAudios = {
    'plant-barbusano': { audio: 'barbusano.mp3', name: 'Barbusano', scientific: 'Apollonias barbujana' },
    'plant-brezo': { audio: 'brezo.mp3', name: 'Brezo', scientific: 'Erica canariensis' },
    'plant-cardon': { audio: 'cardon.mp3', name: 'Cardón', scientific: 'Euphorbia canariensis L.' },
    'plant-cedro': { audio: 'cedro_canario.mp3', name: 'Cedro canario', scientific: 'Juniperus cedrus' },
    'plant-escobon': { audio: 'escorbon_de_pinar.mp3', name: 'Escobón de pinar', scientific: 'Chamaecytisus proliferus' },
    'plant-follado': { audio: 'follao.mp3', name: 'Follado canario', scientific: 'Viburnum rugosum Pers.' },
    'plant-gibalbera': { audio: 'gibalbera.mp3', name: 'Gibalbera', scientific: 'Semele androgyna' },
    'plant-laurel': { audio: 'laurel_canario.mp3', name: 'Laurel canario', scientific: 'Laurus novocanariensis' },
    'plant-madrono': { audio: 'madroño.mp3', name: 'Madroño', scientific: 'Arbutus canariensis' },
    'plant-palmera': { audio: 'palmera_canaria.mp3', name: 'Palmera canaria', scientific: 'Phoenix canariensis' },
    'plant-peralillo': { audio: 'peralillo.mp3', name: 'Peralillo', scientific: 'Gymnosporia cassinoides' },
    'plant-pino': { audio: 'pino_canario.mp3', name: 'Pino canario', scientific: 'Pinus canariensis' },
    'plant-rosalillo-cumbre': { audio: 'rosalillo_de_cumbre.mp3', name: 'Rosalillo de Cumbre', scientific: 'Pterocephalus lasiospermus' },
    'plant-sabina': { audio: 'sabina.mp3', name: 'Sabina canaria', scientific: 'Juniperus turbinata Guss. subsp. canariensis' },
    'plant-til': { audio: 'til.mp3', name: 'Til', scientific: 'Ocotea foetens' },
    'plant-verode': { audio: 'verode.mp3', name: 'Verode', scientific: 'Kleinia neriifolia Haw.' }
  };

  // SVG de altavoz (usamos SVG inline limpio, sin emoticonos)
  const speakerSvg = `
    <svg class="audio-indicator-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  `;

  let currentAudio = null;
  let isSeeking = false;
  const playPauseBtn = document.getElementById('play-pause-btn');
  const svgPlay = document.getElementById('svg-play');
  const svgPause = document.getElementById('svg-pause');
  const svgLoading = document.getElementById('svg-loading');
  const audioProgress = document.getElementById('audio-progress');
  const audioCurrentTime = document.getElementById('audio-current-time');
  const audioDuration = document.getElementById('audio-duration');
  const closeAudioBtn = document.getElementById('close-audio-btn');
  const audioPlantName = document.getElementById('audio-plant-name');
  const audioScientificName = document.getElementById('audio-scientific-name');

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if (audioPlayerEl) {
      audioPlayerEl.classList.remove('show');
    }
  };

  const setPlayState = (state) => {
    if (state === 'loading') {
      svgPlay.style.display = 'none';
      svgPause.style.display = 'none';
      if (svgLoading) svgLoading.style.display = 'block';
    } else if (state === true) {
      svgPlay.style.display = 'none';
      svgPause.style.display = 'block';
      if (svgLoading) svgLoading.style.display = 'none';
    } else {
      svgPlay.style.display = 'block';
      svgPause.style.display = 'none';
      if (svgLoading) svgLoading.style.display = 'none';
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const playAudioForPlant = (plantId) => {
    const audioData = plantAudios[plantId];
    if (!audioData) return;

    if (currentAudio && currentAudio.dataset.plantId === plantId) {
      togglePlayPause();
      return;
    }

    if (currentAudio) currentAudio.pause();

    const audioUrl = `https://franwdev.github.io/ajpd-bucket/audio/${encodeURIComponent(audioData.audio)}`;
    currentAudio = new Audio(audioUrl);
    currentAudio.dataset.plantId = plantId;

    audioPlantName.textContent = audioData.name;
    audioScientificName.innerHTML = `Nombre científico: <i>${audioData.scientific}</i>`;
    audioProgress.value = 0;
    audioCurrentTime.textContent = '0:00';
    audioDuration.textContent = '0:00';

    if (audioPlayerEl) {
      audioPlayerEl.classList.add('show');
    }

    setPlayState('loading');

    currentAudio.addEventListener('loadedmetadata', () => {
      audioDuration.textContent = formatTime(currentAudio.duration);
      audioProgress.max = Math.floor(currentAudio.duration);
    });

    currentAudio.addEventListener('waiting', () => {
      setPlayState('loading');
    });

    currentAudio.addEventListener('playing', () => {
      setPlayState(true);
    });

    currentAudio.addEventListener('pause', () => {
      if (currentAudio && !currentAudio.seeking) {
        setPlayState(false);
      }
    });

    currentAudio.addEventListener('timeupdate', () => {
      if (!isSeeking && currentAudio) {
        audioProgress.value = Math.floor(currentAudio.currentTime);
        audioCurrentTime.textContent = formatTime(currentAudio.currentTime);
      }
    });

    currentAudio.addEventListener('ended', () => {
      setPlayState(false);
      audioProgress.value = 0;
      audioCurrentTime.textContent = '0:00';
    });

    currentAudio.play().catch(err => {
      console.error('Error playing audio:', err);
      setPlayState(false);
    });
  };

  const togglePlayPause = () => {
    if (!currentAudio) return;
    if (currentAudio.paused) {
      setPlayState('loading');
      currentAudio.play().catch(err => {
        console.error('Error playing audio:', err);
        setPlayState(false);
      });
    } else {
      currentAudio.pause();
      setPlayState(false);
    }
  };

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayPause();
    });
  }

  if (closeAudioBtn) {
    closeAudioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAudio();
    });
  }

  if (audioProgress) {
    audioProgress.addEventListener('input', () => {
      isSeeking = true;
      audioCurrentTime.textContent = formatTime(audioProgress.value);
    });

    audioProgress.addEventListener('change', () => {
      if (currentAudio) {
        currentAudio.currentTime = audioProgress.value;
      }
      isSeeking = false;
    });
  }

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
          stopAudio();
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

  // Inicialización de PhotoSphereViewer eliminada porque usamos ES Modules.

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
        },
        { id: 'plant-verode', position: { yaw: 0.1490125289261231, pitch: -0.04234423432468404 }, html: '<div class="plant-marker-label">Verode</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Kleinia neriifolia Haw.</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-cornical', position: { yaw: 1.436835324666589, pitch: -0.30582231814953076 }, html: '<div class="plant-marker-label">Cornical</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Periploca laevigata Aiton</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-incienso', position: { yaw: 0.6951460683837772, pitch: -0.11571865001987858 }, html: '<div class="plant-marker-label">Incienso canario</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Artemisia thuscula Cav.</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-tabaiba-dulce', position: { yaw: 5.7342698927465126, pitch: -0.26133756997801116 }, html: '<div class="plant-marker-label">Tabaiba dulce</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Euphorbia balsamifera Aiton</i>', position: 'top center' }, anchor: 'center center' }
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
        },
        { id: 'plant-cardon', position: { yaw: 3.6273332306424866, pitch: -0.17147876397533546 }, html: '<div class="plant-marker-label">Cardón</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Euphorbia canariensis L.</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-tabaiba-amarga', position: { yaw: 2.9636004370868254, pitch: -0.30644693684649793 }, html: '<div class="plant-marker-label">Tabaiba amarga</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Euphorbia lamarckii Sweet</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-vinagrera', position: { yaw: 4.0706119017945195, pitch: -0.37018354950409593 }, html: '<div class="plant-marker-label">Vinagrera, calcosa</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Rumex lunaria L.</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-salvia', position: { yaw: 0.33821511626619555, pitch: -0.3277814358351258 }, html: '<div class="plant-marker-label">Salvia canaria</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Salvia canariensis L.</i>', position: 'top center' }, anchor: 'center center' }
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
        },
        { id: 'plant-sabina', position: { yaw: 1.639097877832575, pitch: 0.40047208111591104 }, html: '<div class="plant-marker-label">Sabina canaria</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Juniperus turbinata Guss. subsp. canariensis</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-jazmin', position: { yaw: 5.444544442432992, pitch: -0.40753793108819125 }, html: '<div class="plant-marker-label">Jazmín silvestre</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Jasminum odoratissimum L.</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-drago', position: { yaw: 2.9519666956261106, pitch: 0.524854371934387 }, html: '<div class="plant-marker-label">Drago</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Dracaena draco (L.) L.</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-retama', position: { yaw: 0.08404581503810024, pitch: 0.06588612615379574 }, html: '<div class="plant-marker-label">Retama canario</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Teline canariensis</i>', position: 'top center' }, anchor: 'center center' }
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
        },
        { id: 'plant-palosangre', position: { yaw: 0.6031010266997419, pitch: -0.2558135119310563 }, html: '<div class="plant-marker-label">Palosangre</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Marcetella moquiniana</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-hediondo', position: { yaw: 1.745054095324531, pitch: -0.4232953592439781 }, html: '<div class="plant-marker-label">Hediondo o Yerbamora</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Bosea yervamora</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-palmera', position: { yaw: 6.247723221306726, pitch: -0.06640254040461935 }, html: '<div class="plant-marker-label">Palmera canaria</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Phoenix canariensis</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-malvarrisco', position: { yaw: 5.96614703408269, pitch: -0.26525327106812524 }, html: '<div class="plant-marker-label">Malvarrisco</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Navaea phoenicea</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-peralillo', position: { yaw: 5.264564756146173, pitch: -0.49225612757048864 }, html: '<div class="plant-marker-label">Peralillo</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Gymnosporia cassinoides</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-granadillo', position: { yaw: 1.2545961642536037, pitch: -0.17675950705802967 }, html: '<div class="plant-marker-label">Granadillo canario</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Hypericum canariense L.</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-almacigo', position: { yaw: 4.418374123832688, pitch: 0.09520026521582392 }, html: '<div class="plant-marker-label">Almácigo</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Pistacia atlantica</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-guaydil', position: { yaw: 1.036912596152367, pitch: -0.16411702094652414 }, html: '<div class="plant-marker-label">Guaydil</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Convolvulus floridus</i>', position: 'top center' }, anchor: 'center center' }
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
        },
        { id: 'plant-naranjo', position: { yaw: 5.107922801598216, pitch: -0.284204470678757 }, html: '<div class="plant-marker-label">Naranjo salvaje</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Ilex perado Aiton subsp. platyphylla</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-bicacaro', position: { yaw: 1.107764882508876, pitch: -0.8193670189103006 }, html: '<div class="plant-marker-label">Bicácaro</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Canarina canariensis</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-brezo', position: { yaw: 0.37047630660511527, pitch: -0.07473119690979257 }, html: '<div class="plant-marker-label">Brezo</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Erica canariensis</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-esparraguera', position: { yaw: 1.0206474187935428, pitch: -0.3249538518501083 }, html: '<div class="plant-marker-label">Esparraguera o Esparragón</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Sin especificar</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-laurel', position: { yaw: 4.488369733625562, pitch: -0.20006416603721622 }, html: '<div class="plant-marker-label">Laurel canario</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Laurus novocanariensis</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-follado', position: { yaw: 5.98501412055248, pitch: -0.3895591694535099 }, html: '<div class="plant-marker-label">Follado canario</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Viburnum rugosum Pers.</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-aderno', position: { yaw: 2.5731882094371294, pitch: -0.18167169817480255 }, html: '<div class="plant-marker-label">Aderno</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Heberdenia excelsa</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-paloblanco', position: { yaw: 0.8325621096926331, pitch: -0.1360725088652972 }, html: '<div class="plant-marker-label">Paloblanco</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Picconia excelsa</i>', position: 'top center' }, anchor: 'center center' }
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
        },
        { id: 'plant-vinatigo', position: { yaw: 3.2755463052296587, pitch: -0.15740727727732806 }, html: '<div class="plant-marker-label">Viñátigo</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Persea indica (L.) Spreng.</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-gibalbera', position: { yaw: 1.605388969788126, pitch: -0.1323811526111669 }, html: '<div class="plant-marker-label">Gibalbera</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Semele androgyna</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-mocan', position: { yaw: 1.359797893047868, pitch: -0.19115118520002805 }, html: '<div class="plant-marker-label">Mocán</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Visnea mocanera L. f.</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-tedera', position: { yaw: 2.4433785927657348, pitch: -0.5861929914480557 }, html: '<div class="plant-marker-label">Tedera</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Bituminaria bituminosa</i>', position: 'top center' }, anchor: 'center center' }
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
        },
        { id: 'plant-escobon', position: { yaw: 2.173905934577405, pitch: -0.08034406388899407 }, html: '<div class="plant-marker-label">Escobón de pinar</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Chamaecytisus proliferus</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-pino', position: { yaw: 3.0665594453968517, pitch: 0.2542720392789053 }, html: '<div class="plant-marker-label">Pino canario</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Pinus canariensis</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-til', position: { yaw: 0.6390934271664572, pitch: -0.00003768544680493591 }, html: '<div class="plant-marker-label">Til</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Ocotea foetens</i>', position: 'top center' }, anchor: 'center center' }
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
        },
        { id: 'plant-rosalillo-cumbre', position: { yaw: 5.420474535136788, pitch: -0.23817855365606234 }, html: '<div class="plant-marker-label">Rosalillo de Cumbre</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Pterocephalus lasiospermus</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-cedro', position: { yaw: 4.448176040420181, pitch: -0.33104709574760216 }, html: '<div class="plant-marker-label">Cedro canario</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Juniperus cedrus</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-jara-blanca', position: { yaw: 1.4571879599852968, pitch: -0.1929957471063184 }, html: '<div class="plant-marker-label">Jara blanca</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Cistus monspeliensis L.</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-alheli', position: { yaw: 0.16085065934929765, pitch: -0.20148392400447968 }, html: '<div class="plant-marker-label">Alhelí silvestre</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Sin especificar</i>', position: 'top center' }, anchor: 'center center' }
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
        },
        { id: 'plant-barbusano', position: { yaw: 1.8133523652702215, pitch: 0.03464544770308575 }, html: '<div class="plant-marker-label">Barbusano</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Apollonias barbujana</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-tajinaste', position: { yaw: 1.7918381168874515, pitch: -0.11505770104051516 }, html: '<div class="plant-marker-label">Tajinaste</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Sin especificar</i>', position: 'top center' }, anchor: 'center center' },
        { id: 'plant-madrono', position: { yaw: 0.020472205987276976, pitch: -0.034396065505867046 }, html: '<div class="plant-marker-label">Madroño</div>', tooltip: { content: '<b>Nombre científico:</b> <i>Arbutus canariensis</i>', position: 'top center' }, anchor: 'center center' }
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

  // Añadir iconos a marcadores de plantas con audio dinámicamente
  Object.keys(scenes).forEach(key => {
    if (scenes[key].markers) {
      scenes[key].markers.forEach(marker => {
        if (plantAudios[marker.id]) {
          if (marker.html && marker.html.includes('class="plant-marker-label"')) {
            marker.html = marker.html.replace('</div>', `${speakerSvg}</div>`);
          }
        }
      });
    }
  });

  const viewer = new Viewer({
    container: document.querySelector('#virtual-tour-viewer'),
    panorama: scenes.foto1.panorama,
    loadingTxt: 'Cargando...',
    defaultZoomLvl: 0,
    plugins: [
      [MarkersPlugin, {
        markers: scenes.foto1.markers
      }]
    ]
  });

  // Re-insertar capas sobre el visor para que persistan en pantalla completa
  setTimeout(() => {
    const psvInternal = viewer.container.querySelector('.psv-container') || viewer.container;
    psvInternal.appendChild(capturedPlantsSection);
    psvInternal.appendChild(modal);
    if (audioPlayerEl) {
      psvInternal.appendChild(audioPlayerEl);
    }
    updateSidebarVisibility();
  }, 100);

  const updateSidebarVisibility = () => {
    if (secretModeEnabled) {
      capturedPlantsSection.style.setProperty('display', 'flex', 'important');
    } else {
      capturedPlantsSection.style.setProperty('display', 'none', 'important');
    }
  };

  const markersPlugin = viewer.getPlugin(MarkersPlugin);
  let lastMarkerClickTime = 0;
  let currentOpenTooltipId = null;

  markersPlugin.addEventListener('select-marker', ({ marker }) => {
    const now = Date.now();
    if (now - lastMarkerClickTime < 300) {
      console.log("Ignoring rapid double select-marker event for:", marker.id);
      return;
    }
    lastMarkerClickTime = now;

    console.log("select-marker event fired for marker ID:", marker.id);
    const commonOptions = {
      position: viewer.getPosition(),
      zoom: viewer.getZoomLevel(),
    };

    const targetSceneKey = markerMapping[marker.id];
    if (targetSceneKey && scenes[targetSceneKey]) {
      console.log("Navigating to scene:", targetSceneKey);
      stopAudio();
      currentOpenTooltipId = null;
      viewer.setPanorama(scenes[targetSceneKey].panorama, commonOptions).then(() => {
         markersPlugin.setMarkers(scenes[targetSceneKey].markers);
      });
    } else if (marker.id.startsWith('plant-')) {
      console.log("Plant marker selected:", marker.id);
      
      const hasAudio = !!plantAudios[marker.id];
      if (hasAudio) {
        // Si tiene audio, ocultamos cualquier tooltip anterior y no abrimos el tooltip
        if (currentOpenTooltipId && typeof markersPlugin.hideMarkerTooltip === 'function') {
          markersPlugin.hideMarkerTooltip(currentOpenTooltipId);
        }
        currentOpenTooltipId = null;
        console.log("Found audio configuration for:", marker.id);
        playAudioForPlant(marker.id);
      } else {
        // Si no tiene audio, mostramos/ocultamos el tooltip normal
        const activeTooltip = viewer.container.querySelector('.psv-tooltip');
        if (activeTooltip && currentOpenTooltipId === marker.id) {
          if (typeof markersPlugin.hideMarkerTooltip === 'function') {
            markersPlugin.hideMarkerTooltip(marker.id);
          }
          currentOpenTooltipId = null;
        } else {
          if (currentOpenTooltipId && typeof markersPlugin.hideMarkerTooltip === 'function') {
            markersPlugin.hideMarkerTooltip(currentOpenTooltipId);
          }
          if (typeof markersPlugin.showMarkerTooltip === 'function') {
            markersPlugin.showMarkerTooltip(marker.id);
          }
          currentOpenTooltipId = marker.id;
        }
      }
    }
  });

  // Cerrar reproductor de audio y limpiar tooltips cuando se hace clic fuera (en el panorama)
  viewer.addEventListener('click', () => {
    console.log("Viewer clicked (outside), stopping audio and closing tooltips");
    stopAudio();
    if (currentOpenTooltipId && typeof markersPlugin.hideMarkerTooltip === 'function') {
      markersPlugin.hideMarkerTooltip(currentOpenTooltipId);
    }
    currentOpenTooltipId = null;
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
