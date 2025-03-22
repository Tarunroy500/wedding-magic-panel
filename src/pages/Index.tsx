
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FolderTree, Layers, Image, Settings } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-wedding-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-wedding-900">
            Wedding Admin Panel
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A beautiful and intuitive admin panel for managing your wedding website content
          </p>
          
          <div className="mt-10">
            <Link to="/admin">
              <Button 
                className="bg-wedding-500 hover:bg-wedding-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Go to Admin Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className="p-6 h-full border-none shadow-card hover:shadow-card-hover transition-all duration-300">
                <div className={`${feature.bgColor} p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16 text-sm text-muted-foreground"
        >
          Designed with ❤️ for couples to effortlessly manage their wedding website
        </motion.div>
      </div>
    </div>
  );
};

const features = [
  {
    title: "Hero Management",
    description: "Upload, update, delete, and reorder hero section images for each page",
    icon: <Image size={24} className="text-wedding-500" />,
    bgColor: "bg-wedding-100",
  },
  {
    title: "Category Management",
    description: "Create, edit, and organize categories for your wedding photos",
    icon: <FolderTree size={24} className="text-blue-500" />,
    bgColor: "bg-blue-100",
  },
  {
    title: "Album Management",
    description: "Arrange photos into albums within each category",
    icon: <Layers size={24} className="text-purple-500" />,
    bgColor: "bg-purple-100",
  },
  {
    title: "Drag & Drop",
    description: "Intuitive drag-and-drop functionality for reordering content",
    icon: <Settings size={24} className="text-teal-500" />,
    bgColor: "bg-teal-100",
  },
];

export default Index;
