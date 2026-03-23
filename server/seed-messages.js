import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMessages() {
  console.log('🌱 Starting message seeding...\n');

  try {
    // Get employees and clients
    const employees = await prisma.employee.findMany();
    const clients = await prisma.client.findMany();

    if (employees.length === 0 || clients.length === 0) {
      console.log('⚠️  No employees or clients found. Please run the main seed first.');
      return;
    }

    console.log(`📊 Found ${employees.length} employees and ${clients.length} clients\n`);

    // Sample conversations with messages
    const conversationsData = [
      {
        clientIndex: 0, // First client
        employeeIndex: 0, // First employee (Ankit Sharma)
        messages: [
          {
            content: 'Hello, I need help with my GST filing for this quarter.',
            senderType: 'client',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            isRead: true,
            isDelivered: true,
          },
          {
            content: 'Sure! I can help you with that. Do you have all your invoices ready?',
            senderType: 'employee',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            isRead: true,
            isDelivered: true,
          },
          {
            content: 'Yes, I have everything. When can we schedule a meeting?',
            senderType: 'client',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            isRead: true,
            isDelivered: true,
          },
          {
            content: 'How about tomorrow at 2 PM? I\'ll prepare the documents.',
            senderType: 'employee',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            isRead: true,
            isDelivered: true,
          },
          {
            content: 'Perfect! See you tomorrow.',
            senderType: 'client',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            isRead: false,
            isDelivered: true,
          },
        ],
      },
      {
        clientIndex: 1, // Second client
        employeeIndex: 1, // Second employee (Priya Mehta)
        messages: [
          {
            content: 'Hi, I have a question about the tax audit report.',
            senderType: 'client',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            isRead: true,
            isDelivered: true,
          },
          {
            content: 'Hello! I\'d be happy to help. What specific aspect would you like to discuss?',
            senderType: 'employee',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 2 days ago + 30 min
            isRead: true,
            isDelivered: true,
          },
          {
            content: 'The depreciation calculations seem different from last year.',
            senderType: 'client',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 2 days ago + 1 hour
            isRead: true,
            isDelivered: true,
          },
          {
            content: 'Let me review the calculations and get back to you with a detailed explanation.',
            senderType: 'employee',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            isRead: true,
            isDelivered: true,
          },
        ],
      },
      {
        clientIndex: 2, // Third client
        employeeIndex: 0, // First employee
        messages: [
          {
            content: 'Good morning! I need to update my company registration details.',
            senderType: 'client',
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            isRead: false,
            isDelivered: true,
          },
        ],
      },
      {
        clientIndex: 3, // Fourth client
        employeeIndex: 2, // Third employee (Rahul Verma)
        messages: [
          {
            content: 'Can you help me with TDS return filing?',
            senderType: 'client',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            isRead: true,
            isDelivered: true,
          },
          {
            content: 'Absolutely! I\'ll need your Form 16 and salary details.',
            senderType: 'employee',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 3 days ago + 2 hours
            isRead: true,
            isDelivered: true,
          },
          {
            content: 'I\'ll email them to you right away.',
            senderType: 'client',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 days ago + 3 hours
            isRead: true,
            isDelivered: true,
          },
          {
            content: 'Great! I\'ll process it and send you the acknowledgment.',
            senderType: 'employee',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            isRead: true,
            isDelivered: true,
          },
          {
            content: 'Thank you so much! 👍',
            senderType: 'client',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000), // 2 days ago + 1 hour
            isRead: true,
            isDelivered: true,
            reactions: { [employees[2].id]: '👍' },
          },
        ],
      },
      {
        clientIndex: 4, // Fifth client
        employeeIndex: 3, // Fourth employee (Kavita Reddy)
        messages: [
          {
            content: 'Hello! I need assistance with my annual compliance.',
            senderType: 'client',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            isRead: true,
            isDelivered: true,
          },
          {
            content: 'Hi! I can help you with that. Let\'s schedule a call this week.',
            senderType: 'employee',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
            isRead: true,
            isDelivered: true,
          },
          {
            content: 'Sounds good. How about Friday?',
            senderType: 'client',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 6 days ago + 2 hours
            isRead: true,
            isDelivered: true,
          },
        ],
      },
    ];

    let totalConversations = 0;
    let totalMessages = 0;

    // Create conversations and messages
    for (const convData of conversationsData) {
      const client = clients[convData.clientIndex];
      const employee = employees[convData.employeeIndex];

      if (!client || !employee) {
        console.log(`⚠️  Skipping conversation - client or employee not found`);
        continue;
      }

      // Create or get existing conversation
      let conversation = await prisma.conversation.findUnique({
        where: {
          clientId_employeeId: {
            clientId: client.id,
            employeeId: employee.id,
          },
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            clientId: client.id,
            employeeId: employee.id,
          },
        });
        console.log(`✅ Created conversation between ${employee.name} and ${client.name}`);
      } else {
        console.log(`ℹ️  Using existing conversation between ${employee.name} and ${client.name}`);
      }
      
      totalConversations++;

      // Create messages
      for (const msgData of convData.messages) {
        const senderId = msgData.senderType === 'employee' ? employee.id : client.id;
        
        const message = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            content: msgData.content,
            senderId: senderId,
            senderType: msgData.senderType,
            clientId: client.id,
            timestamp: msgData.timestamp,
            isRead: msgData.isRead,
            isDelivered: msgData.isDelivered,
            deliveredAt: msgData.isDelivered ? msgData.timestamp : null,
            readAt: msgData.isRead ? new Date(msgData.timestamp.getTime() + 5 * 60 * 1000) : null,
            reactions: msgData.reactions || null,
          },
        });

        totalMessages++;
      }

      // Update conversation with last message
      const lastMessage = convData.messages[convData.messages.length - 1];
      const unreadCount = convData.messages.filter(
        m => m.senderType === 'client' && !m.isRead
      ).length;

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: lastMessage.timestamp,
          unreadCount: unreadCount,
        },
      });

      console.log(`   → Added ${convData.messages.length} messages (${unreadCount} unread)\n`);
    }

    console.log('📊 Summary:');
    console.log(`   Created: ${totalConversations} conversations`);
    console.log(`   Created: ${totalMessages} messages`);
    console.log('\n✅ Message seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding messages:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedMessages()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
