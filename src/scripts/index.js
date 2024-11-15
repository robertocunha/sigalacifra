// Imports de CSS para uso do Webpack 
import '../css/reset.css';
import '../css/print.css';
import '../css/style.css';

// Importa o Firestore configurado
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';  // Usa 'db' em vez de 'firebaseApp'

const fetchSongs = async () => {
  try {
    const songsCollection = collection(db, 'musicas'); // Nome da coleção com exceção em português
    const songsSnapshot = await getDocs(songsCollection);

    songsSnapshot.forEach((doc) => {
      const { title, tone, position, active } = doc.data(); // Extrai apenas os campos relevantes
      console.log(`Música ID: ${doc.id}`, { title, tone, position, active });
    });
  } catch (error) {
    console.error('Erro ao buscar músicas:', error);
  }
};

// Chama a função ao carregar o script
fetchSongs();
