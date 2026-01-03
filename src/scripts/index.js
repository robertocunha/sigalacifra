import Sortable from 'sortablejs';

// Imports de CSS para uso do Webpack
import '../css/design-tokens.css';
import '../css/components.css';
import '../css/print.css';
import '../css/style.css';

import { collection, query, where, orderBy, doc, updateDoc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from './firebaseConfig.prod.js';

const tableBody = document.getElementById('songs-table').querySelector('tbody');

// Variable to store the Sortable instance
let sortableInstance = null;

// Variable to store current songs data for position calculations
let currentSongs = [];

// Function to update positions in Firestore after drag-and-drop
async function updatePositions(oldIndex, newIndex) {
  // Create a copy of the current songs array
  const reorderedSongs = [...currentSongs];
  
  // Move the item from oldIndex to newIndex
  const [movedSong] = reorderedSongs.splice(oldIndex, 1);
  reorderedSongs.splice(newIndex, 0, movedSong);

  // Calculate new positions (keeping 10-unit gaps)
  const batch = writeBatch(db);
  
  reorderedSongs.forEach((song, index) => {
    const newPosition = (index + 1) * 10;
    if (song.position !== newPosition) {
      const songRef = doc(db, 'musicas', song.id);
      batch.update(songRef, { position: newPosition });
    }
  });

  await batch.commit();
}

// Função para renderizar a tabela com músicas
const renderSongs = (songsSnapshot) => {
  // Limpa qualquer conteúdo antigo da tabela
  tableBody.innerHTML = '';

  // Store current songs data for position calculations
  currentSongs = songsSnapshot.docs.map(doc => ({
    id: doc.id,
    position: doc.data().position,
    ...doc.data()
  }));

  // Preenche a tabela com as músicas ativas e ordenadas
  songsSnapshot.forEach((docSnap) => {
    const { title, tone, position, active } = docSnap.data();

    // Cria uma nova linha para cada música
    const row = document.createElement('tr');
    row.dataset.id = docSnap.id; // Store doc ID for later use
    row.style.minHeight = '60px';

    // Cria células para cada dado
    row.innerHTML = `
      <td class="drag-handle" style="cursor: grab; text-align: center; vertical-align: middle; font-size: 20px; padding: 15px 10px;">⋮⋮</td>
      <td class="title-cell" style="cursor: pointer; padding: 15px 10px;">${title}</td>
      <td style="padding: 15px 10px;">${tone}</td>
      <td style="padding: 15px 10px;"><input type="checkbox" ${active ? 'checked' : ''} data-id="${docSnap.id}"></td>
      <td style="padding: 15px 10px;"><button class="btn btn-danger btn-sm delete-btn" data-id="${docSnap.id}">🗑️</button></td>
    `;

    // Adiciona o evento de clique para redirecionar para song.html com o ID do documento
    const titleCell = row.querySelector('.title-cell');
    titleCell.addEventListener('click', () => {
      window.location.href = `song.html?id=${docSnap.id}`;
    });

    // Adiciona o evento para alterar o estado de 'active' ao clicar no checkbox
    const checkbox = row.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', async (e) => {
      const newActiveState = e.target.checked;
      const songDocRef = doc(db, 'musicas', docSnap.id);

      try {
        // Atualiza o campo 'active' no Firestore
        await updateDoc(songDocRef, {
          active: newActiveState
        });

        // Se desmarcado, a música desaparecerá da lista (após re-renderizar)
        if (!newActiveState) {
          row.style.display = 'none'; // Remove a linha da tabela
        }
      } catch (error) {
        console.error('Erro ao atualizar o estado de ativo da música:', error);
      }
    });

    // Adiciona o evento para deletar a música
    const deleteButton = row.querySelector('.delete-btn');
    deleteButton.addEventListener('click', async (e) => {
      e.stopPropagation(); // Evita que o clique acione outros eventos da linha
      
      const confirmed = confirm(`Tem certeza que deseja deletar "${title}"?`);
      if (!confirmed) return;

      const songDocRef = doc(db, 'musicas', docSnap.id);

      try {
        await deleteDoc(songDocRef);
        console.log('Música deletada com sucesso');
      } catch (error) {
        console.error('Erro ao deletar a música:', error);
        alert('Erro ao deletar a música. Tente novamente.');
      }
    });

    // Insere a linha na tabela
    tableBody.appendChild(row);
  });

  // Initialize or re-initialize Sortable after rendering
  if (sortableInstance) {
    sortableInstance.destroy();
  }

  sortableInstance = new Sortable(tableBody, {
    animation: 150,
    handle: '.drag-handle', // Only the handle can initiate drag
    ghostClass: 'sortable-ghost', // Class for the drop placeholder
    chosenClass: 'sortable-chosen', // Class for the chosen item
    dragClass: 'sortable-drag', // Class for the dragging item
    onEnd: async function(evt) {
      if (evt.oldIndex === evt.newIndex) return; // No change

      console.log('Item dragged from index', evt.oldIndex, 'to', evt.newIndex);
      
      try {
        await updatePositions(evt.oldIndex, evt.newIndex);
        console.log('Positions updated successfully');
      } catch (error) {
        console.error('Error updating positions:', error);
        alert('Erro ao reordenar músicas. Tente novamente.');
      }
    }
  });
};

// Escuta as mudanças em tempo real na coleção de músicas
const listenForSongChanges = () => {
  const songsCollection = collection(db, 'musicas');
  const activeSongsQuery = query(
    songsCollection,
    where('active', '==', true),
    orderBy('position', 'asc')
  );

  onSnapshot(activeSongsQuery, (snapshot) => {
    renderSongs(snapshot); // Chama a função de renderização sempre que houver mudanças
  });
};

// Chama a função para escutar as mudanças em tempo real
listenForSongChanges();
