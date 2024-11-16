// Imports de CSS para uso do Webpack 
import '../css/reset.css';
import '../css/print.css';
import '../css/style.css';

import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
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
    songsSnapshot.forEach((doc) => {
      const { title, tone, position } = doc.data();

      // Cria uma nova linha para cada música
      const row = document.createElement('tr');
      row.style.cursor = 'pointer';

      // Cria células para cada dado
      row.innerHTML = `
        <td>${title}</td>
        <td>${tone}</td>
        <td>${position}</td>
      `;

      // Adiciona o evento de clique para redirecionar para song.html com o ID do documento
      row.addEventListener('click', () => {
        window.location.href = `song.html?id=${doc.id}`;
      });

      // Insere a linha na tabela
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao buscar músicas ativas:', error);
  }
};

// Busca inicial para músicas ativas
fetchActiveSongs();
