
'use server';

import { client } from '@/lib/sanity';
import type { SanityProduct } from '@/types';
import nodemailer from 'nodemailer';
import { OrderItem } from '@/types';
import { ProfileInfo } from '@/context/app-context';
import { adminFirestore, adminMessaging } from '@/lib/firebase-admin';

export interface TrendingSuggestion {
  _id: string;
  title: string;
  searchQuery: string;
}

type EmailOrderDetails = {
  orderId: string;
  total: number;
  items: OrderItem[];
};

export async function getTrendingSuggestions(): Promise<TrendingSuggestion[]> {
  try {
    const suggestions = await client.fetch(`*[_type == "searchSuggestion"]{ _id, title, searchQuery }`);
    return suggestions || [];
  } catch (err) {
    console.error('Failed to fetch trending suggestions:', err);
    return [];
  }
}

export async function getProductSuggestions(query: string): Promise<SanityProduct[]> {
  if (!query.trim()) return [];

  const stopWords = ["a", "an", "the", "is", "in", "it", "of", "for", "on", "with", "to", "was", "and", "or", "but", "best"];
  const searchWords = new Set(query.trim().toLowerCase().split(/\s+/).filter(w => !stopWords.includes(w) && w));
  
  if (searchWords.size === 0) return [];

  // 1. Broadly fetch any product that matches at least one word in any key field.
  const wordFilters = Array.from(searchWords).map(word => 
    `lower(name) match "*${word}*" || lower(bestFor) match "*${word}*" || tags[] match "*${word}*"`
  ).join(' || ');

  const productQuery = `*[_type=="product" && (${wordFilters})]{
    _id, name, slug, "images": images[].asset->url, tags, bestFor,
    availableFlavours[]->{ name }
  }`;

  try {
    const products: SanityProduct[] = await client.fetch(productQuery);

    // 2. Score products using a weighted system based on match location.
    const scoredProducts = products.map(product => {
      const productNameLower = product.name.toLowerCase();
      const productBestForLower = product.bestFor?.toLowerCase() || '';
      const productTagsLower = product.tags?.map(tag => tag.toLowerCase()) || [];
      const productFlavoursLower = product.availableFlavours?.map(f => f.name.toLowerCase()) || [];

      let score = 0;
      let matchedWordsCount = 0;

      for (const word of searchWords) {
        let wordMatched = false;

        // **PRIORITY 1: Tags & Flavours (Highest Score)**
        if (productTagsLower.some(tag => tag.includes(word)) || productFlavoursLower.some(flavour => flavour.includes(word))) {
          score += 5;
          wordMatched = true;
        }

        // **PRIORITY 2: Product Name/Title (Medium Score)**
        if (productNameLower.includes(word)) {
          score += 3;
          wordMatched = true;
        }
        
        // **PRIORITY 3: "Best For" Field (Lowest Score)**
        if (productBestForLower.includes(word)) {
          score += 1;
          wordMatched = true;
        }

        if(wordMatched) {
            matchedWordsCount++;
        }
      }
      
      // **BONUS: Add a large bonus for matching ALL search words.**
      if (matchedWordsCount === searchWords.size) {
        score += 10;
      }

      return { ...product, score };
    });

    // 3. Sort by the new weighted score and return the top 5 results.
    return scoredProducts
      .filter(p => p.score > 0) // Ensure we only return products that have a score
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

  } catch (err) {
    console.error('Failed to fetch suggestions:', err);
    return [];
  }
}

export async function sendAdminOrderNotification(
  orderDetails: EmailOrderDetails,
  customerDetails: ProfileInfo
) {
  // 1. Setup the transporter with your Gmail credentials
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // 2. Format the list of items for the email
  const itemsListHtml = orderDetails.items
    .map(
      (item) =>
        `<li>
          <strong>${item.name}</strong> x ${item.quantity} 
          ${item.flavours && item.flavours.length > 0 ? `(${item.flavours.map(f => f.name).join(', ')})` : ''}
          - ₹${item.finalSubtotal}
        </li>`
    )
    .join('');

  // 3. Configure the email options
  const mailOptions = {
    from: `"ChocoSmiley App" <${process.env.GMAIL_USER}>`,
    to: 'venkattiwari42@gmail.com', // Sending to ADMIN
    subject: `🔔 New Order! ₹${orderDetails.total.toFixed(2)} from ${customerDetails.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #5C2881;">New Order Received!</h1>
        <p>You have received a new order with ID: <strong>${orderDetails.orderId}</strong></p>
        
        <hr />
        
        <h3>👤 Customer Details</h3>
        <p>
          <strong>Name:</strong> ${customerDetails.name}<br/>
          <strong>Phone:</strong> ${customerDetails.phone}<br/>
          <strong>Address:</strong> ${customerDetails.address}<br/>
          <strong>Email:</strong> ${customerDetails.email}
        </p>

        <hr />

        <h3>🍫 Order Summary</h3>
        <ul>${itemsListHtml}</ul>
        <a href="https://www.chocosmiley.com/admin">Visit Choco Smiley for more details</a>
        
        <h2 style="text-align: left;">Total: ₹${orderDetails.total.toFixed(2)}</h2>
        
        <hr />
        <p style="font-size: 12px; color: #888;">This is an automated notification from your Choco Smiley Site.</p>
      </div>
    `,
  };

  // 4. Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return { success: false, error };
  }
}

// 1. New Helper Action to Subscribe Devices
export async function subscribeToAdminTopic(token: string) {
  if (!adminMessaging) {
    console.error('Firebase Admin Messaging not initialized. Cannot subscribe to topic.');
    return { success: false };
  }
  try {
    // This adds the device to the "admin-orders" broadcasting channel
    await adminMessaging.subscribeToTopic(token, 'admin-orders');
    return { success: true };
  } catch (error) {
    console.error('Topic subscription failed:', error);
    return { success: false };
  }
}

// 2. Update the Send Notification Function
export async function sendAdminPushNotification(orderId: string, amount: number, customerName: string) {
  if (!adminMessaging) {
    console.error('Firebase Admin Messaging not initialized. Cannot send push notification.');
    return { success: false };
  }
  try {
    const formattedAmount = amount.toFixed(2);

    // CHANGE: Send to 'topic' instead of 'token'
    await adminMessaging.send({
      topic: 'admin-orders', // <--- Broadcast to everyone on this topic
      notification: {
        title: '💰 New Order Received!',
        body: `Order ${orderId} by ${customerName} for ₹${formattedAmount}`,
      },
      webpush: {
        fcmOptions: {
          link: `https://chocosmiley.com/admin?orderId=${orderId}`
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Push notification failed:', error);
    return { success: false, error };
  }
}

// export async function sendAdminPushNotification(orderId: string, amount: number, customerName: string) {
//   try {
//     // 1. Fetch the stored Admin Token
//     const adminDoc = await adminFirestore.collection('notifications').doc('admin').get();
    
//     if (!adminDoc.exists || !adminDoc.data()?.token) {
//       console.log('No admin token found for push notification');
//       return { success: false };
//     }

//     const token = adminDoc.data()?.token;
//     const formattedAmount = amount.toFixed(2);

//     // 2. Send the message
//     await adminMessaging.send({
//       token: token,
//       notification: {
//         title: '💰 New Order Received!',
//         body: `Order ${orderId} by ${customerName} for ₹${formattedAmount}`,
//       },
//       webpush: {
//         fcmOptions: {
//           link: `https://www.chocosmiley.com/admin?orderId=${orderId}` // Deep link to admin panel
//         }
//       }
//     });

//     return { success: true };
//   } catch (error) {
//     console.error('Push notification failed:', error);
//     return { success: false, error }; // Don't crash the app if notification fails
//   }
// }

