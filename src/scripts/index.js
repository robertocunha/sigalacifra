import 'bootstrap/dist/css/bootstrap.min.css'; // Estilos
import 'bootstrap'; // Funcionalidades JS (requer Popper.js)

// Imports de CSS para uso do Webpack
import '../css/print.css';
import '../css/style.css';

import { collection, query, where, orderBy, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig.js';

const tableBody = document.getElementById('songs-table').querySelector('tbody');

// Função para renderizar a tabela com músicas
const renderSongs = (songsSnapshot) => {
  // Limpa qualquer conteúdo antigo da tabela
  tableBody.innerHTML = '';

  // Preenche a tabela com as músicas ativas e ordenadas
  songsSnapshot.forEach((docSnap) => {
    const { title, tone, position, active } = docSnap.data();

    // Cria uma nova linha para cada música
    const row = document.createElement('tr');
    row.style.cursor = 'pointer';

    // Cria células para cada dado
    row.innerHTML = `
      <td class="title-cell">${title}</td> <!-- Célula do título agora com classe 'title-cell' -->
      <td>${tone}</td>
      <td><input type="checkbox" ${active ? 'checked' : ''} data-id="${docSnap.id}"></td> <!-- Checkbox para ativar/desativar -->
      <td><button class="btn btn-danger btn-sm delete-btn" data-id="${docSnap.id}">🗑️</button></td>
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
