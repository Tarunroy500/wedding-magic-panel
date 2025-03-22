
import React from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '@/context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Image, 
  FolderTree, 
  Album, 
  Layers,
  BarChart3,
  Eye,
  CloudUpload,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { heroImages, categories, albums, images } = useAdmin();

  // Stats data
  const stats = [
    {
      title: 'Hero Images',
      value: heroImages.length,
      icon: <Image className="h-8 w-8 text-wedding-500" />,
      link: '/admin/hero',
      bgColor: 'bg-pink-50',
      textColor: 'text-wedding-500',
    },
    {
      title: 'Categories',
      value: categories.length,
      icon: <FolderTree className="h-8 w-8 text-blue-500" />,
      link: '/admin/categories',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-500',
    },
    {
      title: 'Albums',
      value: albums.length,
      icon: <Album className="h-8 w-8 text-purple-500" />,
      link: '/admin/albums',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-500',
    },
    {
      title: 'Images',
      value: images.length,
      icon: <Layers className="h-8 w-8 text-teal-500" />,
      link: '/admin/albums',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-500',
    },
  ];

  // Recent activity (for demo purposes)
  const recentActivity = [
    {
      action: 'Uploaded a new hero image',
      time: '2 hours ago',
      icon: <CloudUpload className="h-5 w-5 text-blue-500" />,
    },
    {
      action: 'Created a new album "Reception"',
      time: '4 hours ago',
      icon: <Album className="h-5 w-5 text-purple-500" />,
    },
    {
      action: 'Added 12 images to "Wedding Ceremony"',
      time: 'Yesterday',
      icon: <Image className="h-5 w-5 text-teal-500" />,
    },
    {
      action: 'Created a new category "Family"',
      time: '2 days ago',
      icon: <FolderTree className="h-5 w-5 text-wedding-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Welcome to Wedding Admin</h1>
        <Link to="/" target="_blank">
          <button className="flex items-center gap-2 bg-wedding-50 text-wedding-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-wedding-100 transition-colors">
            <Eye size={16} />
            View Live Site
          </button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link}>
              <Card className="hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden">
                <CardContent className="pt-6 pb-4 px-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    {stat.icon}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                Content Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.slice(0, 4).map((category) => {
                  const categoryAlbums = albums.filter(album => album.categoryId === category.id);
                  const categoryImages = images.filter(image => 
                    categoryAlbums.some(album => album.id === image.albumId)
                  );
                  
                  return (
                    <div key={category.id} className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {categoryAlbums.length} albums · {categoryImages.length} images
                        </p>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-wedding-400 rounded-full"
                          style={{ width: `${Math.min(100, categoryImages.length * 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="mt-0.5">
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
