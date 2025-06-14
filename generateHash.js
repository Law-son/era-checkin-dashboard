import bcrypt from 'bcrypt';

const password = 'Admin@123'; // Replace this with your desired password
const saltRounds = 10;

try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Generated Hash:', hash);
    
    // Verify the hash (optional, just to demonstrate it works)
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash verification:', isValid); // Should print true
} catch (err) {
    console.error('Error:', err);
} 