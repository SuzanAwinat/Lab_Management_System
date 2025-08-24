const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemCode: {
    type: String,
    required: [true, 'Item code is required'],
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['equipment', 'consumable', 'software', 'furniture', 'safety', 'tool', 'component', 'other'],
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  lab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true
  },
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: true
  },
  quantity: {
    total: {
      type: Number,
      required: true,
      min: 0
    },
    available: {
      type: Number,
      required: true,
      min: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    },
    damaged: {
      type: Number,
      default: 0,
      min: 0
    },
    inMaintenance: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  unit: {
    type: String,
    enum: ['piece', 'set', 'box', 'pack', 'bottle', 'kg', 'g', 'l', 'ml', 'meter', 'roll'],
    default: 'piece'
  },
  specifications: {
    brand: String,
    model: String,
    serialNumber: String,
    manufacturer: String,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
      unit: String
    },
    technicalSpecs: mongoose.Schema.Types.Mixed
  },
  purchase: {
    vendor: {
      name: String,
      contact: String,
      email: String
    },
    purchaseDate: Date,
    warrantyExpiry: Date,
    invoiceNumber: String,
    unitCost: {
      type: Number,
      required: true,
      min: 0
    },
    totalCost: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  location: {
    building: String,
    room: String,
    shelf: String,
    bin: String,
    coordinates: String
  },
  condition: {
    type: String,
    enum: ['new', 'excellent', 'good', 'fair', 'poor', 'damaged', 'obsolete'],
    default: 'good'
  },
  maintenance: {
    lastMaintenance: Date,
    nextScheduledMaintenance: Date,
    maintenanceInterval: Number, // in days
    maintenanceHistory: [{
      date: Date,
      type: String,
      description: String,
      cost: Number,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  usage: {
    isConsumable: {
      type: Boolean,
      default: false
    },
    minimumStock: {
      type: Number,
      default: 1
    },
    reorderPoint: {
      type: Number,
      default: 5
    },
    reorderQuantity: {
      type: Number,
      default: 10
    },
    averageUsagePerMonth: Number,
    lastUsed: Date,
    totalUsageCount: {
      type: Number,
      default: 0
    }
  },
  tracking: {
    barcode: String,
    qrCode: String,
    rfidTag: String,
    assetTag: String
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: Date
  }],
  alerts: {
    lowStock: {
      type: Boolean,
      default: false
    },
    maintenanceDue: {
      type: Boolean,
      default: false
    },
    warrantyExpiring: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'pending', 'disposed'],
    default: 'active'
  },
  disposalInfo: {
    disposalDate: Date,
    disposalMethod: String,
    disposalReason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
inventorySchema.index({ itemCode: 1 });
inventorySchema.index({ lab: 1, category: 1 });
inventorySchema.index({ campus: 1 });
inventorySchema.index({ 'quantity.available': 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ 'alerts.lowStock': 1 });

// Virtual for total value
inventorySchema.virtual('totalValue').get(function() {
  return this.quantity.total * this.purchase.unitCost;
});

// Virtual for availability percentage
inventorySchema.virtual('availabilityPercentage').get(function() {
  if (this.quantity.total === 0) return 0;
  return ((this.quantity.available / this.quantity.total) * 100).toFixed(2);
});

// Method to check if reorder is needed
inventorySchema.methods.needsReorder = function() {
  return this.quantity.available <= this.usage.reorderPoint;
};

// Method to check if item is available
inventorySchema.methods.isAvailable = function(quantity = 1) {
  return this.quantity.available >= quantity && this.status === 'active';
};

// Method to reserve items
inventorySchema.methods.reserve = async function(quantity) {
  if (this.quantity.available < quantity) {
    throw new Error('Insufficient quantity available');
  }
  this.quantity.available -= quantity;
  this.quantity.reserved += quantity;
  return await this.save();
};

// Method to release reserved items
inventorySchema.methods.release = async function(quantity) {
  if (this.quantity.reserved < quantity) {
    throw new Error('Invalid release quantity');
  }
  this.quantity.reserved -= quantity;
  this.quantity.available += quantity;
  return await this.save();
};

// Pre-save hook to calculate total cost
inventorySchema.pre('save', function(next) {
  if (this.purchase.unitCost && this.quantity.total) {
    this.purchase.totalCost = this.purchase.unitCost * this.quantity.total;
  }
  
  // Check for alerts
  if (this.quantity.available <= this.usage.minimumStock) {
    this.alerts.lowStock = true;
  } else {
    this.alerts.lowStock = false;
  }
  
  // Check maintenance alert
  if (this.maintenance.nextScheduledMaintenance) {
    const daysTillMaintenance = Math.floor((this.maintenance.nextScheduledMaintenance - new Date()) / (1000 * 60 * 60 * 24));
    this.alerts.maintenanceDue = daysTillMaintenance <= 7;
  }
  
  // Check warranty alert
  if (this.purchase.warrantyExpiry) {
    const daysTillWarrantyExpiry = Math.floor((this.purchase.warrantyExpiry - new Date()) / (1000 * 60 * 60 * 24));
    this.alerts.warrantyExpiring = daysTillWarrantyExpiry <= 30;
  }
  
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);