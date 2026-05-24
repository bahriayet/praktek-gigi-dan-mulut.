import { callAi } from '../app/actions/aiActions';

async function test() {
  console.log('Testing AI connection...');
  try {
    const response = await callAi('Halo, ini tes koneksi.', 'patient');
    console.log('Response Success:', response);
  } catch (error: any) {
    console.error('Response Failed:', error.message);
  }
}

test();
