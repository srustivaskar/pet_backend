const mongoose = require('mongoose');
const Service = require('./models/Service');
const SubscriptionPlan = require('./models/SubscriptionPlan');
require('dotenv').config();

const services = [
  {
    name: 'Pet Walking',
    description: 'Daily or weekly exercise for your pet. Professional dog walkers ensure your pet gets the exercise they need.',
    price: 25,
    duration: 30,
    category: 'exercise',
    features: ['30-minute walk', 'GPS tracking', 'Photo updates', 'Flexible scheduling'],
    requirements: ['Pet must be leash-trained', 'Up-to-date vaccinations'],
    isActive: true
  },
  {
    name: 'Pet Grooming',
    description: 'Complete grooming service including bathing, hair trimming, nail clipping, and ear cleaning.',
    price: 50,
    duration: 90,
    category: 'grooming',
    features: ['Bath with premium shampoo', 'Hair cut & styling', 'Nail trimming', 'Ear cleaning', 'Teeth brushing'],
    requirements: ['Pet must be calm during grooming', 'Flea-free'],
    isActive: true
  },
  {
    name: 'Veterinary Checkup',
    description: 'Routine health assessments by certified veterinarians to keep your pet healthy.',
    price: 75,
    duration: 45,
    category: 'health',
    features: ['Complete physical exam', 'Weight check', 'Temperature check', 'Health consultation', 'Vaccination review'],
    requirements: ['Bring vaccination records', 'Pet carrier recommended'],
    isActive: true
  },
  {
    name: 'Pet Training',
    description: 'Professional obedience and behavioral training for dogs of all ages.',
    price: 60,
    duration: 60,
    category: 'training',
    features: ['Basic commands', 'Behavioral correction', 'Socialization tips', 'Take-home materials'],
    requirements: ['Pet must be at least 8 weeks old', 'Owner participation required'],
    isActive: true
  },
  {
    name: 'Pet Sitting',
    description: 'In-home pet care while you are away. Your pet stays comfortable in their own environment.',
    price: 40,
    duration: 120,
    category: 'care',
    features: ['Feeding & water', 'Playtime', 'Medication administration', 'Home security check', 'Daily updates'],
    requirements: ['House key required', 'Emergency contact needed'],
    isActive: true
  },
  {
    name: 'Pet Photography',
    description: 'Professional photo sessions to capture your pet\'s personality and create lasting memories.',
    price: 100,
    duration: 60,
    category: 'other',
    features: ['1-hour session', '20+ edited photos', 'Multiple poses', 'Props included', 'Digital delivery'],
    requirements: ['Pet should be comfortable with strangers', 'Outdoor location preferred'],
    isActive: true
  }
];

const subscriptions = [
  {
    name: 'Basic',
    price: 19.99,
    duration: 30,
    features: [
      'Monthly pet health tips newsletter',
      '1 pet walking session per week',
      'Access to booking for standard pet services',
      'Email support'
    ],
    isActive: true
  },
  {
    name: 'Premium',
    price: 49.99,
    duration: 30,
    features: [
      'Weekly pet walking sessions',
      '2 grooming sessions per month',
      'Priority booking for services',
      'Monthly vet consultation (virtual)',
      'Phone & email support'
    ],
    isActive: true
  },
  {
    name: 'Elite',
    price: 89.99,
    duration: 30,
    features: [
      'Unlimited pet walking & daycare services',
      'Weekly grooming sessions',
      'Personalized training sessions monthly',
      'Priority 24/7 customer support',
      'Emergency vet hotline access'
    ],
    isActive: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Service.deleteMany({});
    await SubscriptionPlan.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert services
    const createdServices = await Service.insertMany(services);
    console.log(`✅ Created ${createdServices.length} services`);

    // Insert subscriptions
    const createdSubscriptions = await SubscriptionPlan.insertMany(subscriptions);
    console.log(`✅ Created ${createdSubscriptions.length} subscription plans`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nServices created:');
    createdServices.forEach(service => {
      console.log(`  - ${service.name} ($${service.price})`);
    });

    console.log('\nSubscription plans created:');
    createdSubscriptions.forEach(sub => {
      console.log(`  - ${sub.name} ($${sub.price}/month)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
