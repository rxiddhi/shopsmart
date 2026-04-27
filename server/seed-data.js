const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create a seller
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const seller = await prisma.seller.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      passwordHash: hashedPassword,
      name: 'GameVault Store',
      businessName: 'GameVault Official Store',
      businessInfo: JSON.stringify({
        address: '123 Gaming Street, Mumbai, India',
        phone: '+91-9876543210',
        taxId: 'GST123456789',
      }),
      sellerType: 'pc_games',
      status: 'active',
      verified: true,
    },
  });

  console.log('Created seller:', seller.email);

  // Create sample game products
  const products = [
    // PC Games
    {
      name: 'Cyberpunk 2077',
      description: 'Open-world action-adventure RPG set in Night City. Includes all DLCs and updates.',
      price: 2999,
      stock: 100,
      category: 'pc_games',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500']),
      attributes: JSON.stringify({ platform: 'Steam', genre: 'RPG', rating: 'M' }),
      sellerId: seller.id,
    },
    {
      name: 'Elden Ring',
      description: 'Epic fantasy action RPG from FromSoftware. Explore the Lands Between.',
      price: 3499,
      stock: 150,
      category: 'pc_games',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500']),
      attributes: JSON.stringify({ platform: 'Steam', genre: 'Action RPG', rating: 'M' }),
      sellerId: seller.id,
    },
    {
      name: 'Red Dead Redemption 2',
      description: 'Epic tale of life in America at the dawn of the modern age. Story mode included.',
      price: 2499,
      stock: 200,
      category: 'pc_games',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500']),
      attributes: JSON.stringify({ platform: 'Steam', genre: 'Action-Adventure', rating: 'M' }),
      sellerId: seller.id,
    },
    {
      name: 'The Witcher 3: Wild Hunt',
      description: 'Award-winning RPG with all expansions. Over 100 hours of gameplay.',
      price: 1499,
      stock: 300,
      category: 'pc_games',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500']),
      attributes: JSON.stringify({ platform: 'Steam', genre: 'RPG', rating: 'M' }),
      sellerId: seller.id,
    },
    
    // Console Games
    {
      name: 'God of War Ragnarök',
      description: 'PlayStation 5 exclusive. Epic Norse mythology adventure with Kratos and Atreus.',
      price: 4999,
      stock: 75,
      category: 'console_games',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500']),
      attributes: JSON.stringify({ platform: 'PlayStation 5', genre: 'Action-Adventure', rating: 'M' }),
      sellerId: seller.id,
    },
    {
      name: 'The Legend of Zelda: Tears of the Kingdom',
      description: 'Nintendo Switch exclusive. Explore Hyrule and the skies above.',
      price: 4499,
      stock: 80,
      category: 'console_games',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500']),
      attributes: JSON.stringify({ platform: 'Nintendo Switch', genre: 'Action-Adventure', rating: 'E10+' }),
      sellerId: seller.id,
    },
    {
      name: 'Halo Infinite',
      description: 'Xbox Series X|S. Master Chief returns in this epic sci-fi shooter.',
      price: 3999,
      stock: 90,
      category: 'console_games',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=500']),
      attributes: JSON.stringify({ platform: 'Xbox Series X|S', genre: 'FPS', rating: 'T' }),
      sellerId: seller.id,
    },
    
    // Mobile Games
    {
      name: 'PUBG Mobile UC - 3000',
      description: '3000 Unknown Cash for PUBG Mobile. Instant delivery via game ID.',
      price: 2999,
      stock: 500,
      category: 'mobile_games',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1556438064-2d7646166914?w=500']),
      attributes: JSON.stringify({ platform: 'iOS/Android', type: 'In-Game Currency' }),
      sellerId: seller.id,
    },
    {
      name: 'Genshin Impact Genesis Crystals',
      description: '6480 Genesis Crystals pack. Instant top-up for your account.',
      price: 4999,
      stock: 400,
      category: 'mobile_games',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500']),
      attributes: JSON.stringify({ platform: 'iOS/Android', type: 'In-Game Currency' }),
      sellerId: seller.id,
    },
    {
      name: 'Call of Duty Mobile CP',
      description: '10000 COD Points for Call of Duty Mobile. Unlock premium content.',
      price: 7999,
      stock: 300,
      category: 'mobile_games',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=500']),
      attributes: JSON.stringify({ platform: 'iOS/Android', type: 'In-Game Currency' }),
      sellerId: seller.id,
    },
    
    // Gaming Gear
    {
      name: 'Razer BlackWidow V3 Mechanical Keyboard',
      description: 'RGB mechanical gaming keyboard with green switches. Programmable keys.',
      price: 8999,
      stock: 50,
      category: 'gaming_gear',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500']),
      attributes: JSON.stringify({ brand: 'Razer', type: 'Keyboard', connectivity: 'Wired' }),
      sellerId: seller.id,
    },
    {
      name: 'Logitech G502 HERO Gaming Mouse',
      description: 'High-performance gaming mouse with 25K DPI sensor. 11 programmable buttons.',
      price: 4999,
      stock: 75,
      category: 'gaming_gear',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1527814050087-3793815479db?w=500']),
      attributes: JSON.stringify({ brand: 'Logitech', type: 'Mouse', dpi: '25000' }),
      sellerId: seller.id,
    },
    {
      name: 'HyperX Cloud II Gaming Headset',
      description: '7.1 surround sound gaming headset. Comfortable memory foam ear cups.',
      price: 6999,
      stock: 60,
      category: 'gaming_gear',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1599669454699-248893623440?w=500']),
      attributes: JSON.stringify({ brand: 'HyperX', type: 'Headset', surround: '7.1' }),
      sellerId: seller.id,
    },
    {
      name: 'Xbox Wireless Controller',
      description: 'Official Xbox controller. Works with PC, Xbox Series X|S, and mobile.',
      price: 4499,
      stock: 100,
      category: 'gaming_gear',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=500']),
      attributes: JSON.stringify({ brand: 'Microsoft', type: 'Controller', connectivity: 'Wireless' }),
      sellerId: seller.id,
    },
    {
      name: 'Gaming Chair Pro',
      description: 'Ergonomic gaming chair with lumbar support. Adjustable armrests and recline.',
      price: 15999,
      stock: 25,
      category: 'gaming_gear',
      sellerType: 'pc_games',
      images: JSON.stringify(['https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500']),
      attributes: JSON.stringify({ type: 'Chair', material: 'PU Leather', adjustable: true }),
      sellerId: seller.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
    console.log(`Created game/gear: ${product.name}`);
  }

  // Create a regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash: hashedPassword,
      name: 'Demo Gamer',
    },
  });

  console.log('Created user:', user.email);
  console.log('\n✅ Database seeding completed!');
  console.log('\nDemo Credentials:');
  console.log('Seller: seller@example.com / password123');
  console.log('User: user@example.com / password123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
