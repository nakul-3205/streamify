import { Router } from "express";
import { registerUser ,loginUser,refreshacesstoken,logoutUser,updatecoverimage,
        updateavatarimage,
        updateaccountdetail,
        getcurrentuser,
        changecurrentpassword,
        getchannelprofile,
        getwatchhistory} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";




const router = Router()

router.route('/register').post(
    upload.fields([
        {name : 'avatar',
            maxCount:1
        },{
            name : 'coverimage',
            maxCount:1
        }
    ]),
    
    registerUser)

router.route("/login").post(loginUser)
router.route("/refreshtoken").post(refreshacesstoken)
//secured route

router.route("/logout").post(verifyJwt,logoutUser)
router.route("/changepassword").post(verifyJwt,changecurrentpassword)
router.route("/currentuser").get(verifyJwt,getcurrentuser)
router.route("/c/:username").post(verifyJwt,getchannelprofile)
router.route("/update-account").patch(verifyJwt,updateaccountdetail)
router.route("/avatar").patch(verifyJwt,upload.single("avatar"),updateavatarimage)
router.route("/cover").patch(verifyJwt,upload.single("cover"),updatecoverimage)
router.route("/watch-history").patch(verifyJwt,getwatchhistory)











export default router