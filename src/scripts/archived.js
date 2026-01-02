// CSS imports
import '../css/components.css';

// Imports de CSS para uso do Webpack
import '../css/print.css';
import '../css/style.css';

import { collection, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.prod.js';

const tableBody = document.getElementById('songs-table').querySelector('tbody');

// Função para buscar músicas arquivadas e ordená-las por posição
const fetchArchivedSongs = async () => {
  try {
    const songsCollection = collection(db, 'musicas');
    const archivedSongsQuery = query(
      songsCollection,
      where('active', '==', false), // Filtro para músicas arquivadas
      orderBy('position', 'asc') // Ordena as músicas pela posição em ordem crescente
    );
    const songsSnapshot = await getDocs(archivedSongsQuery);

    // Limpa qualquer conteúdo antigo da tabela
    tableBody.innerHTML = '';

    // Preenche a tabela com as músicas arquivadas e ordenadas
    songsSnapshot.forEach((docSnap) => {
      const { title, tone, position, active } = docSnap.data();

      // Cria uma nova linha para cada música
      const row = document.createElement('tr');
      row.style.cursor = 'pointer';

      // Cria células para cada dado
      row.innerHTML = `
        <td class="title-cell">${title}</td>
        <td>${tone}</td>
        <td><input type="checkbox" ${active ? 'checked' : ''} data-id="${docSnap.id}" ${active ? 'disabled' : ''}></td> <!-- Checkbox habilitado ou desabilitado -->
        <td><button class="btn btn-danger btn-sm delete-btn" data-id="${docSnap.id}">🗑️</button></td>
      `;

      // Adiciona o evento de clique para redirecionar para song.html com o ID do documento
      const titleCell = row.querySelector('.title-cell');
      titleCell.addEventListener('click', () => {
        window.location.href = `song.html?id=${docSnap.id}`;
      });

      // Adiciona o evento para mudar o estado de 'active' ao marcar o checkbox
      const checkbox = row.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', async (e) => {
        const newActiveState = e.target.checked;
        const songDocRef = doc(db, 'musicas', docSnap.id);

        try {
          // Atualiza o campo 'active' no Firestore para reativar a música
          await updateDoc(songDocRef, {
            active: newActiveState
          });

          // Se marcado, a música será reativada e desaparece da lista de arquivadas
          if (newActiveState) {
            row.style.display = 'none'; // Remove a linha da tabela

            // Atualiza a página para refletir a remoção da música da lista arquivada
            setTimeout(() => {
              fetchArchivedSongs(); // Recarrega a lista de músicas arquivadas
            }, 1000);
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
          // Remove a linha da tabela imediatamente
          row.remove();
        } catch (error) {
          console.error('Erro ao deletar a música:', error);
          alert('Erro ao deletar a música. Tente novamente.');
        }
      });

      // Insere a linha na tabela
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao buscar músicas arquivadas:', error);
  }
};

// Busca inicial para músicas arquivadas
fetchArchivedSongs();
