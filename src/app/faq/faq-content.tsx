// @/components/faq-content.tsx
'use client';
import { PortableText } from '@portabletext/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionTitle } from "@/components/section-title";

// Define the type for our FAQ items based on the Sanity schema
export interface FaqItem {
  _id: string;
  question: string;
  answer: any; // PortableText content can be complex
}

const staticFaqs: Omit<FaqItem, '_id'>[] = [
    {
        question: "How do I place an order for a custom box?",
        answer: [{ _key: "1", _type: "block", style: "normal", children: [{ _key: "1a", _type: "span", text: "You can place an order directly from our catalog. Simply click on a product, select your preferred flavors and packaging style, and then proceed to finalize your order. Our team will get in touch with you to confirm the details." }] }]
    },
    {
        question: "Can I include a personalized message with my order?",
        answer: [{ _key: "2", _type: "block", style: "normal", children: [{ _key: "2a", _type: "span", text: "Yes, absolutely! We love helping you add a personal touch. When our team contacts you to confirm your order, you can let them know what message you would like to include." }] }]
    },
    {
        question: "Do you offer bulk or corporate orders?",
        answer: [{ _key: "3", _type: "block", style: "normal", children: [{ _key: "3a", _type: "span", text: "Yes, we specialize in creating custom corporate and bulk orders. Please contact our team directly for a personalized quote." }] }]
    },
    {
        question: "Are all your chocolates vegetarian and eggless?",
        answer: [{ _key: "4", _type: "block", style: "normal", children: [{ _key: "4a", _type: "span", text: "Yes! All of our chocolates are proudly 100% vegetarian and completely eggless, made with the finest, high-quality ingredients." }] }]
    },
    {
      question: "Do your chocolates contain any allergens?",
      answer: [{ _key: "5", _type: "block", style: "normal", children: [{ _key: "5a", _type: "span", text: "Our chocolates contain soy and may contain traces of milk solids and nuts. For specific allergen information, please refer to the product page." }] }]
  },
  {
    question: "What is your shipping policy?",
    answer: [{ _key: "6", _type: "block", style: "normal", children: [{ _key: "6a", _type: "span", text: "Shipping timelines and costs depend on your location and the size of your order. Our team will provide you with an estimated delivery date and shipping cost when they finalize your order." }] }]
},
{
  question: "Do you ship internationally?",
  answer: [{ _key: "7", _type: "block", style: "normal", children: [{ _key: "7a", _type: "span", text: "Currently, we only ship within India." }] }]
},
{
  question: "Can I order a mix of flavors in one box?",
  answer: [{ _key: "8", _type: "block", style: "normal", children: [{ _key: "8a", _type: "span", text: "Yes, absolutely! We specialize in creating personalized assortments. You can select a variety of flavors and fillings to create a box that is perfectly tailored to your taste." }] }]
},
{
  question: "Why do some flavors cost extra?",
  answer: [{ _key: "9", _type: "block", style: "normal", children: [{ _key: "9a", _type: "span", text: "Certain specialty flavors, such as those with premium nuts or unique ingredients, require an additional charge to cover the cost of sourcing. This cost is clearly shown on the product page before you add the item to your cart." }] }]
},
{
  question: "How should I store the chocolates to keep them fresh?",
  answer: [{ _key: "10", _type: "block", style: "normal", children: [{ _key: "10a", _type: "span", text: "To maintain their quality and flavor, store your chocolates in a cool, dry place, away from direct sunlight. Refrigeration isn't required." }] }]
},
  
];

export function FaqContent({ sanityFaqs }: { sanityFaqs: FaqItem[] }) {
  // Add a unique _id to static FAQs for the key prop
  const allFaqs = [
      ...staticFaqs.map((faq, index) => ({ ...faq, _id: `static-${index}` })),
      ...sanityFaqs
  ];

  return (
    <div className="bg-[#5D2B79] rounded-[20px] md:rounded-[40px] mt-8 mb-8 mx-4 md:mx-16 lg:mx-32 animate-fade-in flex flex-col flex-grow" style={{ animationDuration: '0.5s', animationDelay: '0.2s', animationFillMode: 'both' }}>
      <div className="bg-white/10 rounded-[20px] md:rounded-[40px] py-8 px-4 md:py-10 md:px-8 lg:px-24 flex-grow">
        <SectionTitle className="text-3xl md:text-4xl text-center mb-8 md:mb-12 font-poppins px-0 md:px-0">
          Frequently Asked Questions
        </SectionTitle>
        
        <div className="max-w-4xl mx-auto">
          {allFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {allFaqs.map((item) => (
                <AccordionItem key={item._id} value={item._id} className="bg-black/20 rounded-2xl px-4 md:px-6 border-b-0">
                  <AccordionTrigger className="text-left text-base md:text-xl font-bold text-white hover:no-underline data-[state=open]:text-custom-gold hover:text-custom-gold transition-colors duration-300 py-4 md:py-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pt-0 pb-4 md:pb-5 text-white/80 text-sm md:text-base leading-relaxed">
                    <PortableText value={item.answer} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-white/80">No frequently asked questions have been added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
