import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productModel.js';

// Configuration Cloudinary avec tes variables d'environnement
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});

const generateCustomId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let id = '';
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

export const listProducts = async (req, res) => {
  try {
    const { category, subCategory, search, page = 1, limit = 50, sort = 'date' } = req.query;
    
    // ✅ IMPORTANT: Filtrer seulement les produits actifs
    let filter = { isActive: true };
    
    if (category && category !== 'All') filter.category = category;
    if (subCategory && subCategory !== 'All') filter.subCategory = subCategory;
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { sku: searchRegex }
      ];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
    
    let sortOption = {};
    switch(sort) {
      case 'price-low': sortOption = { price: 1 }; break;
      case 'price-high': sortOption = { price: -1 }; break;
      case 'bestseller': sortOption = { bestseller: -1, sales: -1 }; break;
      case 'name': sortOption = { name: 1 }; break;
      default: sortOption = { date: -1 };
    }

    const [products, total] = await Promise.all([
      productModel
        .find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(Math.min(100, Number(limit)))
        .lean(),
      productModel.countDocuments(filter)
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    console.log('Add product request received');
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
    console.log('Body:', req.body);

    const {
      name, description, price, stock,
      category, subCategory, sku,
      concentration, volume, form,
      bestseller
    } = req.body;

    // Validation
    const errors = {};
    if (!name?.trim()) errors.name = 'Name is required';
    if (!description?.trim()) errors.description = 'Description is required';
    if (!price || isNaN(price) || parseFloat(price) <= 0) errors.price = 'Valid price required';
    if (!category) errors.category = 'Category is required';
    if (!subCategory) errors.subCategory = 'Sub-category is required';
    if (!sku?.trim()) errors.sku = 'SKU is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors 
      });
    }

    // Check for existing SKU
    const existingSku = await productModel.findOne({ 
      sku: sku.toUpperCase().trim() 
    });
    
    if (existingSku) {
      return res.status(400).json({ 
        success: false, 
        message: 'SKU already exists',
        field: 'sku'
      });
    }

    // Process images
    const imagesUrl = [];
    const imageFields = ['image1', 'image2', 'image3', 'image4'];
    
    for (const field of imageFields) {
      if (req.files?.[field]?.[0]) {
        try {
          const result = await cloudinary.uploader.upload(
            req.files[field][0].path,
            { 
              folder: 'mass-labs/products',
              quality: 'auto:good',
              fetch_format: 'auto'
            }
          );
          imagesUrl.push(result.secure_url);
          console.log(`Uploaded ${field}:`, result.secure_url);
        } catch (uploadError) {
          console.error(`Failed to upload ${field}:`, uploadError.message);
          return res.status(400).json({
            success: false,
            message: `Image upload failed: ${uploadError.message}`
          });
        }
      }
    }

    if (imagesUrl.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one image is required'
      });
    }

    // Generate unique custom ID
    let customId = generateCustomId();
    let attempts = 0;
    while (await productModel.findById(customId) && attempts < 10) {
      customId = generateCustomId();
      attempts++;
    }

    const product = new productModel({
      _id: customId,
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      image: imagesUrl,
      category,
      subCategory,
      sku: sku.toUpperCase().trim(),
      specifications: {
        concentration: concentration || null,
        volume: volume || null,
        form: form || 'Other'
      },
      bestseller: bestseller === 'true' || bestseller === true,
      isActive: true, // ✅ Produit actif par défaut
      date: Date.now()
    });

    await product.save();
    console.log('✅ Product created:', product._id);

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product: { 
        _id: product._id, 
        name: product.name, 
        sku: product.sku,
        imageCount: imagesUrl.length
      }
    });

  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to add product'
    });
  }
};

export const singleProduct = async (req, res) => {
  try {
    const { productId, sku } = req.body;
    
    if (!productId && !sku) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID or SKU required' 
      });
    }

    let query = { isActive: true }; // ✅ Ne montrer que les actifs
    if (productId) query._id = productId;
    else query.sku = sku.toUpperCase();

    const product = await productModel.findOne(query);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    product.views += 1;
    await product.save();

    const related = await productModel
      .find({ 
        category: product.category, 
        _id: { $ne: product._id }, 
        isActive: true 
      })
      .limit(4)
      .select('name price image category subCategory')
      .lean();

    res.json({ 
      success: true, 
      product,
      relatedProducts: related 
    });
  } catch (error) {
    console.error('Single product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId, ...updates } = req.body;
    
    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    if (updates.name) product.name = updates.name.trim();
    if (updates.description) product.description = updates.description.trim();
    if (updates.price) product.price = parseFloat(updates.price);
    if (updates.stock !== undefined) product.stock = parseInt(updates.stock);
    if (updates.bestseller !== undefined) {
      product.bestseller = updates.bestseller === 'true' || updates.bestseller === true;
    }
    if (updates.isActive !== undefined) {
      product.isActive = updates.isActive === 'true' || updates.isActive === true;
    }

    if (req.files && Object.keys(req.files).length > 0) {
      const newImages = [];
      const imageFields = ['image1', 'image2', 'image3', 'image4'];
      
      for (const field of imageFields) {
        if (req.files[field]?.[0]) {
          const result = await cloudinary.uploader.upload(
            req.files[field][0].path,
            { folder: 'mass-labs/products' }
          );
          newImages.push(result.secure_url);
        }
      }
      
      if (newImages.length > 0) product.image = newImages;
    }

    await product.save();
    
    res.json({ 
      success: true, 
      message: 'Product updated successfully',
      product: {
        _id: product._id,
        name: product.name,
        modified: new Date()
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID required' 
      });
    }

    // Soft delete - marquer comme inactif au lieu de supprimer
    const result = await productModel.findByIdAndUpdate(id, { isActive: false });
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    console.error('Remove product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { productId, stock } = req.body;
    
    if (!productId || stock === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID and stock value required' 
      });
    }

    const product = await productModel.findByIdAndUpdate(
      productId,
      { stock: parseInt(stock) },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({ 
      success: true, 
      stock: product.stock,
      productId: product._id
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};