const express=require('express');
const {body}=require('express-validator/check');
const router=express.Router();
const maincontrollers=require('../controllers/maincontrollers');
const isauthenticated = require('../middleware/isauthenticated');
const MulterMultiple = require('../middleware/multer-insertproduct');
const upload = require('../middleware/multer-profile');
const Employee = require('../model/empolyee');
const Products = require('../model/products');



router.post('/signup',[
    body('name').isAlpha().withMessage("Use the Alpha numeric word")
    .not().isEmpty().withMessage("Name is empty kindly body filed"),
    body('email').isEmail().withMessage("Your email is not valid")
    .not().isEmpty().withMessage("Empty the filed kindly body").custom((value,{req})=>{
        return Employee.findOne({where:{email:value}}).then(user=>{
            if(user){
                return Promise.reject('Email exists');
            }
        })
    }),
    body('password').trim().isLength({min:5}).withMessage("password length greater than 5").isAlphanumeric().withMessage("password contain  a-b,1-9").not().isEmpty().withMessage("password is empty "),
    body('confirmpassword').trim().not().isEmpty().isLength({min:5}).withMessage("password greater than 5").isAlphanumeric().withMessage('Confirm  password contain  a-b,1-9')
    .custom((value,{req})=>{
        console.log(value,req.body.password);
        if(value!==req.body.password){
            throw new Error("password does not match");
        }
        return true
    })
    ,

],maincontrollers.signup);

router.post('/login',[
      body('email').trim().not().isEmpty().withMessage("Email is empty")
        .isEmail().withMessage("Email not valid").normalizeEmail(),
      body('password').trim().not().isEmpty().withMessage('password is empty').isLength({min:5})
        .withMessage('password length is less 5'),
    ],maincontrollers.login)
router.get('/get-profile',isauthenticated,maincontrollers.getprofile);
router.get('/get-category',maincontrollers.getcategory);
router.post('/get-cart',maincontrollers.getcart);

router.put('/put-profile',
isauthenticated,upload.single('image'),[
        body('email').trim().not().isEmpty()
        .withMessage("Email filed is empty")
        .isEmail().withMessage("Email is not valid")
        .normalizeEmail(),
        body('name').trim().not().isEmpty()
        .withMessage("Name filed is empty")
        .isLength({min:5})
        .withMessage("Length is greater than 5"),
        ],maincontrollers.putprofile);
router.post('/insert-product',isauthenticated,MulterMultiple.array('images',5),[
    body('productname').trim().not().isEmpty().isLength({max:100}).withMessage('Length in product name'),
    body('productcode').trim().not().isEmpty().isLength({max:100}).withMessage('Length in product code')
    .custom((value)=>{
     return   Products.findOne({where:{productcode:value}})
        .then(product=>{
             if(product){
                return  Promise.reject('Already exist this product');
             }
        })
        
    }),
    body('quantity').isInt({min:1,max:10000000000})
    .withMessage('Your quantity will be greater than 1 and less than 10000000000'),
    body('categoryid').trim().not().isEmpty().withMessage('Category id is required'),
    body('unit').trim().not().isEmpty().withMessage('Category id is required'),
    body('stores').trim().not().isEmpty().withMessage('Category id is required'),
    body('saleprice').trim().not().isEmpty().withMessage('kindly field the saleprice')
    .isFloat('kidly field the decimal number'),
    body('purchaseprice').trim().not().isEmpty().withMessage('purchase price is required')
    .custom((value,{req})=>{
        if(req.body.saleprice<value){
             throw new Error('sale price will be greater than purchase price')
        }
        return  true;
    }),
    body('barcode').trim().not().isEmpty().withMessage('barcode is not empty'),
    body('supplier').trim().not().isEmpty().withMessage('supplier is required').isAlphanumeric(),
    body('contact').trim().not().isEmpty().withMessage('contact is required').isNumeric().withMessage('value will be numeric')
    .isLength({min:11, max:11}).withMessage('contact no will be 11'),
    body('address').not().isEmpty().withMessage('address will be street no and location'),
    body('description').not().isEmpty().withMessage('description not empty'),
    body('company').not().isEmpty().withMessage('company name not empty'),
],maincontrollers.insertproduct);
router.post('/search-products',isauthenticated,[
    body('key')
    .trim().not().isEmpty()
    .isLength({max:30})
    .withMessage('Length greater than the 30')
],maincontrollers.searchproducts);
router.post('/get-product',isauthenticated,[body('id').not().isEmpty().withMessage('product id show not null')],maincontrollers.getproduct);
router.post('/insert-feature',isauthenticated,maincontrollers.insertfeature)
router.post('/get-products',maincontrollers.getProducts);
router.post('/searchcart-product',isauthenticated,maincontrollers.searchcartproducts);
router.post('/insert-cart',isauthenticated,[
    body('productId').not().isEmpty()
    .custom((value)=>{
        return Products.findOne({where:{id:value}})
        .then(product=>{
            console.log('produ.',product)
            if(product.unitsinstock===0){
              return Promise.reject('This product is not available in stock');
            }
        })
    })
],maincontrollers.insertcart);
router.post('/post-quantity',maincontrollers.addquantity);
router.post('/post-order',isauthenticated,
[
    body('customername').trim().not().isEmpty().withMessage('Customer name is required').isAlpha(),
    body('contactno').trim().optional({checkFalsy:true}).isAlpha(),
    body('cartId').trim().not().isEmpty().withMessage('Carts will be required').isInt(),
    body('employeeid').trim().not().isEmpty().withMessage('Employees will be required').isInt(),
    // body('totalprice').not().isEmpty().withMessage('total price validation issue ').isDecimal(),
]
,
maincontrollers.postOrder);
router.post('/delete-cart',maincontrollers.deletecart);
router.post('/search-product',maincontrollers.searchproduct);
router.post('/add-stock',maincontrollers.addstock);
router.post('/delete-stock',maincontrollers.deletestock);
router.post('/get-report',maincontrollers.getreport);


router.get('/get-stock',maincontrollers.getstock);
router.get('/get-cities',maincontrollers.getcities);
router.get('/get-unit',maincontrollers.getunit);
router.get('/get-stores',maincontrollers.getstores);
router.get('/insert-city',maincontrollers.insertcity);
router.get('/sale-record',maincontrollers.salerecord);

router.put('/edit-product',isauthenticated,MulterMultiple.array('productimage',5),[
    body('productname').trim().not().isEmpty().isLength({max:100}).withMessage('Length in product name'),
    body('productcode').trim().not().isEmpty().isLength({max:100}).withMessage('Length in product code')
    .custom((value,{req})=>{
        console.log('hei')
    console.log('id.',req.body.id)
     return   Products.findOne({where:{id:req.body.id}})
        .then(product=>{
            console.log('prod.',product);
             if(product.productcode!==value){
                return  Promise.reject('you not change the product code');
             }
        })
        
    }),
    body('quantity').isInt({min:1,max:10000000000})
    .withMessage('Your quantity will be greater than 1 and less than 10000000000'),
    body('categoryid').trim().not().isEmpty().withMessage('Category id is required'),
    body('unitid').trim().not().isEmpty().withMessage('Category id is required'),
    body('storeid').trim().not().isEmpty().withMessage('store id is required'),
    body('saleprice').trim().not().isEmpty().withMessage('kindly field the saleprice')
    .isFloat('kidly field the decimal number'),
    body('purchaseprice').trim().not().isEmpty().withMessage('purchase price is required')
    .custom((value,{req})=>{
        if(req.body.saleprice<value){
             throw new Error('sale price will be greater than purchase price')
        }
        return  true;
    }),
    body('barcode').trim().not().isEmpty().withMessage('barcode is not empty'),
    body('supplier').trim().not().isEmpty().withMessage('supplier is required').isAlphanumeric(),
    body('contactno').trim().not().isEmpty().withMessage('contact is required').isNumeric().withMessage('value will be numeric')
    .isLength({min:11, max:11}).withMessage('contact no will be 11'),
    body('address').not().isEmpty().withMessage('address will be street no and location'),
    body('description').not().isEmpty().withMessage('description not empty'),
    body('companyname').not().isEmpty().withMessage('company name is required'),
],maincontrollers.updateproduct);

router.get('/',maincontrollers.home);


module.exports=router;