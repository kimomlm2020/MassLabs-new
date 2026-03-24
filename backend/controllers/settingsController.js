import Settings from '../models/settingsModel.js';

// Get or create settings
export const getSettings = async (req, res) => {
  try {
    console.log('[Settings] GET /api/admin/settings');
    console.log('[Settings] User:', req.user?.id, 'Role:', req.user?.role);

    let settings = await Settings.findOne().lean();

    // Create default if not exists (singleton pattern handled here)
    if (!settings) {
      console.log('[Settings] No settings found, creating defaults...');
      try {
        const newSettings = new Settings();
        await newSettings.save();
        settings = newSettings.toObject();
        console.log('[Settings] Default settings created successfully');
      } catch (createError) {
        // If creation failed (e.g., race condition), try to fetch again
        console.log('[Settings] Create failed, retrying fetch:', createError.message);
        settings = await Settings.findOne().lean();

        if (!settings) {
          throw new Error('Failed to create or fetch settings');
        }
      }
    }

    // Clean up response
    const responseSettings = { ...settings };
    delete responseSettings.__v;

    console.log('[Settings] Success, returning settings');

    res.json({
      success: true,
      settings: responseSettings
    });
  } catch (error) {
    console.error('[Settings] GET Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings: ' + error.message
    });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    console.log('[Settings] POST /api/admin/settings');
    console.log('[Settings] User:', req.user?.id);

    const updateData = { ...req.body };

    // Remove internal fields
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.__v;

    let settings = await Settings.findOne();

    if (!settings) {
      console.log('[Settings] Creating new settings document');
      settings = new Settings(updateData);
    } else {
      console.log('[Settings] Updating existing settings');
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          settings[key] = updateData[key];
        }
      });
    }

    await settings.save();

    console.log('[Settings] Saved successfully');

    res.json({
      success: true,
      message: 'Settings saved successfully',
      settings: settings.toObject()
    });
  } catch (error) {
    console.error('[Settings] POST Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to save settings: ' + error.message
    });
  }
};

// Test email
export const testEmail = async (req, res) => {
  try {
    const { smtp } = req.body;

    if (!smtp?.smtpHost || !smtp?.smtpUser) {
      return res.status(400).json({
        success: false,
        message: 'SMTP configuration incomplete'
      });
    }

    res.json({
      success: true,
      message: 'Email test passed (simulated)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email test failed: ' + error.message
    });
  }
};

// Test Stripe
export const testStripe = async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Stripe key required'
      });
    }

    res.json({
      success: true,
      message: 'Stripe test passed (simulated)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Stripe test failed: ' + error.message
    });
  }
};

// Upload image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: imageUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed: ' + error.message
    });
  }
};