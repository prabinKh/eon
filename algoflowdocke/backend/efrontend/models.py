from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from company.models import Company
import uuid

User = get_user_model()

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='categories', db_index=True, null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=500, blank=True, null=True)
    icon = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    subcategories = models.JSONField(default=list, blank=True)
    brand_list = models.JSONField(default=list, blank=True)
    sections = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']
        unique_together = ('company', 'slug')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        try:
            from .media_utils import localize_category_media
            localize_category_media(self)
        except Exception:
            pass
        super().save(*args, **kwargs)

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} -> {self.name}"
        return self.name

    def get_ancestors(self):
        """Returns a list of ancestor categories from root down to immediate parent."""
        ancestors = []
        try:
            curr = self.parent
        except Exception:
            return []
        seen = set()
        while curr and curr.id not in seen:
            seen.add(curr.id)
            ancestors.insert(0, curr)
            try:
                curr = curr.parent
            except Exception:
                break
        return ancestors

    def get_descendants(self, include_self=False, seen=None):
        """Recursively get all descendant categories."""
        if seen is None:
            seen = set()
        if self.id in seen:
            return []
        seen.add(self.id)
        descendants = [self] if include_self else []
        for child in self.children.filter(is_active=True):
            descendants.extend(child.get_descendants(include_self=True, seen=seen))
        return descendants

    def get_full_path(self):
        """Returns the full slug path e.g. 'network-products/network-cameras/wizmind-4-series/smart-dual-lght'."""
        ancestors = self.get_ancestors()
        slugs = [a.slug for a in ancestors] + [self.slug]
        return "/".join(slugs)

    @property
    def full_path(self):
        return self.get_full_path()

    @property
    def depth(self):
        return len(self.get_ancestors())


class Brand(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='brands', db_index=True, null=True, blank=True)
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255)
    description = models.TextField(blank=True)
    logo = models.CharField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    categories = models.ManyToManyField(Category, related_name='brands', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ('company', 'slug')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        try:
            from .media_utils import localize_brand_media
            localize_brand_media(self)
        except Exception:
            pass
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='products', db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    brand_name = models.CharField(max_length=255, blank=True)
    type = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    specs = models.JSONField(default=list, blank=True)
    detailed_specs = models.JSONField(default=dict, blank=True)
    features = models.JSONField(default=list, blank=True)
    colors = models.JSONField(default=list, blank=True)
    collections = models.JSONField(default=list, blank=True)
    details = models.TextField(blank=True)
    key_specifications = models.JSONField(default=list, blank=True)
    
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount = models.IntegerField(default=0)
    
    image = models.CharField(max_length=500, blank=True, null=True)
    gallery = models.JSONField(default=list, blank=True)
    model_3d = models.CharField(max_length=500, blank=True, null=True)
    model_3d_frames = models.JSONField(default=list, blank=True)
    datasheet_url = models.CharField(max_length=500, blank=True, null=True)
    downloads = models.JSONField(default=list, blank=True)
    
    stock = models.IntegerField(default=0, db_index=True)
    in_stock = models.BooleanField(default=True, db_index=True)
    out_of_stock_since = models.DateTimeField(null=True, blank=True, db_index=True)
    is_end_stock = models.BooleanField(default=False, db_index=True)
    free_shipping = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    is_offer = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)
    
    rating = models.FloatField(default=0)
    reviews_count = models.IntegerField(default=0)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('company', 'slug')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'is_active']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['company', 'created_at']),
        ]

    def __str__(self):
        return f'{self.name} ({self.company.name})'

    def save(self, *args, **kwargs):
        from django.utils import timezone
        if not self.slug:
            self.slug = slugify(self.name)
        
        try:
            from .media_utils import localize_product_media
            localize_product_media(self)
        except Exception:
            pass

        if self.stock > 0:
            self.in_stock = True
            self.out_of_stock_since = None
            self.is_end_stock = False
        else:
            self.in_stock = False
            if not self.out_of_stock_since:
                self.out_of_stock_since = timezone.now()
            
            # Check if it has been out of stock for more than 1 day
            if self.out_of_stock_since and (timezone.now() - self.out_of_stock_since).days >= 1:
                self.is_end_stock = True
        
        super().save(*args, **kwargs)


class Order(models.Model):
    STATUS_CHOICES = [
        ('new', 'New Order'),
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('process_conform', 'PC (Process Conform)'),
        ('cancelled', 'Cancelled'),
        ('process_dont_conform', 'PDC (Don\'t Conform)'),
        ('returned', 'Returned'),
    ]
    PAYMENT_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('cod', 'Cash on Delivery'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    uid = models.CharField(max_length=50, unique=True, db_index=True)
    order_id = models.CharField(max_length=50, unique=True, db_index=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='orders', db_index=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    
    full_name = models.CharField(max_length=255)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='new', db_index=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='pending')
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, blank=True)
    
    source = models.CharField(max_length=50, blank=True)
    customer_type = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'status']),
            models.Index(fields=['company', 'created_at']),
            models.Index(fields=['user', 'company']),
        ]

    def __str__(self):
        return f'Order {self.order_id} - {self.company.name}'

    def save(self, *args, **kwargs):
        if not self.uid:
            import uuid
            self.uid = str(uuid.uuid4())
        if not self.order_id:
            from datetime import datetime
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            import random
            self.order_id = f'ORD{timestamp}{random.randint(1000, 9999)}'
        
        # Stock management logic
        if self.pk:
            try:
                old_order = Order.objects.get(pk=self.pk)
                if old_order.status != 'process_conform' and self.status == 'process_conform':
                    for item in self.items.all():
                        if item.product:
                            item.product.stock -= item.quantity
                            item.product.save()
            except Order.DoesNotExist:
                pass
        elif self.status == 'process_conform':
            # This is for orders created via POS or direct API with 'process_conform' status
            # We can't access self.items yet because it's not saved. 
            # We might need to handle this in the view for creation.
            pass
            
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_id_str = models.CharField(max_length=36, blank=True)
    name = models.CharField(max_length=255)
    image = models.URLField(blank=True, null=True)
    features = models.JSONField(default=dict, blank=True)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f'{self.name} (x{self.quantity})'

    def save(self, *args, **kwargs):
        if self.product:
            self.product_id_str = str(self.product.id)
        super().save(*args, **kwargs)


class Collection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='available_collections', null=True, blank=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('company', 'name')
        ordering = ['name']

    def __str__(self):
        return self.name


class HeroSetting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='hero_settings', null=True, blank=True)
    title = models.CharField(max_length=255, blank=True)
    subtitle = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=500, blank=True, null=True)
    background_image = models.CharField(max_length=500, blank=True, null=True)
    card_image = models.CharField(max_length=500, blank=True, null=True)
    video_url = models.CharField(max_length=500, blank=True, null=True)
    media_type = models.CharField(max_length=20, default='image', blank=True)
    badge_text = models.CharField(max_length=100, blank=True, default='New Tech Arrival')
    cta_text = models.CharField(max_length=100, blank=True, default='Explore Catalog')
    cta_link = models.CharField(max_length=255, blank=True, default='/products')
    specs = models.JSONField(default=list, blank=True)
    order = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f'Hero #{self.order} - {self.title or "Slide"} ({self.company.name if self.company else "Platform"})'



class Wishlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='wishlists', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlists')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('company', 'user', 'product')
        ordering = ['-added_at']

    def __str__(self):
        return f'{self.user.email} - {self.product.name}'


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.product.name} - {self.rating}★ by {self.user.email}'


class StoreLocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='store_locations')
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f'{self.name} - {self.company.name}'


class AIRecommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='ai_recommendations', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    query = models.TextField(blank=True)
    recommendations = models.JSONField(default=list, blank=True)
    reasoning = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Rec for {self.user.email if self.user else "Guest"} at {self.company.name if self.company else "Unknown"}'


class CompanySolution(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='solutions', null=True, blank=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    category = models.CharField(max_length=120, default='Surveillance & Security')
    tagline = models.CharField(max_length=255, blank=True)
    summary = models.TextField(blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, default='ShieldCheck')
    image = models.CharField(max_length=500, blank=True, null=True)
    features = models.JSONField(default=list, blank=True)
    architecture_points = models.JSONField(default=list, blank=True)
    target_industries = models.JSONField(default=list, blank=True)
    recommended_products = models.JSONField(default=list, blank=True)
    contact_email = models.CharField(max_length=255, blank=True, default='')
    contact_phone = models.CharField(max_length=50, blank=True, default='')
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or 'solution'
            slug = base_slug
            counter = 1
            while CompanySolution.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.category})"


class SpecialOffer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='special_offers', null=True, blank=True)
    title = models.CharField(max_length=255)
    badge_text = models.CharField(max_length=100, blank=True, default='EXCLUSIVE PROMOTION')
    subtitle = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=500, blank=True, null=True)  # Primary offer image
    images = models.JSONField(default=list, blank=True)  # Max image upload feature (multiple gallery images)
    discount_label = models.CharField(max_length=100, blank=True)  # e.g. "Up to 40% OFF"
    coupon_code = models.CharField(max_length=50, blank=True)
    cta_text = models.CharField(max_length=100, blank=True, default='Explore Offers')
    cta_link = models.CharField(max_length=255, blank=True, default='/offers')
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"Offer: {self.title} ({self.company.name if self.company else 'Platform'})"


class HomePageContent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='home_content', null=True, blank=True)

    # 1. Brand Foundation / About Section
    about_badge = models.CharField(max_length=100, default="BRAND FOUNDATION")
    about_title = models.CharField(max_length=255, default="One Trusted Partner for IT, Security & Business Solutions.")
    about_subtitle = models.CharField(max_length=255, default="Technology Distribution for Nepal’s Business Ecosystem")
    about_description = models.TextField(default="EON Technology is a dedicated B2B technology distribution partner connecting world-class global technology brands with Nepal’s dealers, system integrators, and business customers. We make hardware access, technical specifications, and channel support easier through one trusted partner across IT • Security • Networking • Audio.")
    about_image = models.CharField(max_length=500, blank=True, null=True, default="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80")
    about_features = models.JSONField(default=list, blank=True)
    about_cta_text = models.CharField(max_length=100, default="Become an EON Channel Partner")
    about_cta_link = models.CharField(max_length=255, default="/solutions")
    about_secondary_cta_text = models.CharField(max_length=100, default="Contact EON Technology")
    about_secondary_cta_link = models.CharField(max_length=255, default="/service-center")

    # 2. Why Choose Us Section
    why_badge = models.CharField(max_length=100, default="ENTERPRISE EXCELLENCE")
    why_title = models.CharField(max_length=255, default="Why Nepal’s Technology Channel Chooses EON")
    why_description = models.TextField(default="Engineered for uncompromising reliability, official distribution warranties, fast RMA processing, and certified engineer support.")
    why_items = models.JSONField(default=list, blank=True)

    # 3. Services Showcase Section
    services_badge = models.CharField(max_length=100, default="AUTHORIZED TECHNICAL SERVICES")
    services_title = models.CharField(max_length=255, default="Component Maintenance & Technical Support")
    services_description = models.TextField(default="Certified component-level diagnosis, hardware warranty RMA processing, enterprise surveillance SLAs, and rapid turnaround.")
    services_items = models.JSONField(default=list, blank=True)

    # 4. Products / Solutions Showcase Section
    products_badge = models.CharField(max_length=100, default="PRODUCTS")
    products_title = models.CharField(max_length=255, default="Powering Possibilities With Complete IT Solutions")
    products_description = models.TextField(default="EON Technology offers a wide range of products from mobile to computing products, servers, storage, networking, security, surveillance, GIS, databases, video conferencing etc.")
    products_cta_text = models.CharField(max_length=100, default="View More")
    products_cta_link = models.CharField(max_length=255, default="/solutions")
    products_items = models.JSONField(default=list, blank=True)

    # 5. Live Numbers / Impact Counters
    counters = models.JSONField(default=list, blank=True)

    # 6. Featured Hardware Catalog Section
    catalog_badge = models.CharField(max_length=100, default="OFFICIAL PRODUCT CATALOG")
    catalog_title = models.CharField(max_length=255, default="Genuine Hardware & Solutions Portfolio")
    catalog_description = models.TextField(default="Official manufacturer warranty products across Dahua, CP Plus, Ant Esports, Intex, and Bestor available directly for Nepal's IT channel.")
    catalog_cta_text = models.CharField(max_length=100, default="Explore All Hardware")
    catalog_cta_link = models.CharField(max_length=255, default="/category/all")

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Home Page Content for {self.company.name if self.company else 'Platform'}"


