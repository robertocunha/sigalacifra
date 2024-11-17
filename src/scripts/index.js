// Imports de CSS para uso do Webpack 
import '../css/reset.css';
import '../css/print.css';
import '../css/style.css';

import { collection, getDocs, query, where, orderBy, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';

const tableBody = document.getElementById('songs-table').querySelector('tbody');

// Função para buscar músicas ativas e ordená-las por posição
const fetchActiveSongs = async () => {
  try {
    const songsCollection = collection(db, 'musicas');
    const activeSongsQuery = query(
      songsCollection,
      where('active', '==', true),
      orderBy('position', 'asc') // Ordena as músicas pela posição em ordem crescente
    );
    const songsSnapshot = await getDocs(activeSongsQuery);

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
        <td>${position}</td>
        <td><input type="checkbox" ${active ? 'checked' : ''} data-id="${docSnap.id}"></td> <!-- Checkbox para ativar/desativar -->
      `;

      // Adiciona o evento de clique para redirecionar para song.html com o ID do documento
      // Redireciona apenas se a célula clicada for a do título
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

      // Insere a linha na tabela
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao buscar músicas ativas:', error);
  }
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
    // Limpa a tabela antes de recarregar as músicas
    tableBody.innerHTML = '';

    snapshot.forEach((docSnap) => {
      const { title, tone, position, active } = docSnap.data();

      // Cria uma nova linha para cada música
      const row = document.createElement('tr');
      row.style.cursor = 'pointer';

      // Cria células para cada dado
      row.innerHTML = `
        <td class="title-cell">${title}</td> <!-- Célula do título agora com classe 'title-cell' -->
        <td>${tone}</td>
        <td>${position}</td>
        <td><input type="checkbox" ${active ? 'checked' : ''} data-id="${docSnap.id}"></td> <!-- Checkbox para ativar/desativar -->
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

      // Insere a linha na tabela
      tableBody.appendChild(row);
    });
  });
};

// Chama a função para buscar as músicas ativas inicialmente
fetchActiveSongs();

// Escuta as mudanças em tempo real na coleção de músicas
listenForSongChanges();
