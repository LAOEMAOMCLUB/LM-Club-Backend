import { UserDetail } from "./user.entity";
import { SubscriptionType } from "./subscriptionType.entity";
import { UserSubscription } from "./userSubscription.entity";
import { CardDetail } from "./cardDetails.entity";
import { State } from "./state.entity";
import { City } from "./city.entity";
import { WidgetMaster } from "./widget.entity";
import { EmailTemplate } from "./emailTemplate.entity";
import { Settings } from "./settings.entity";
import { StatusMaster } from "./status.entity";
import { SubscriptionWidgetMap } from "./subscriptionWidgetMap.entity";
import { UserVerification } from "./userVerification.entity";
import { Role } from "./role.entity";
import { BusinessUserDetail } from "./businessUserDetail.entity"
import { RewardPointsMaster } from "./rewardPointsMaster.entity";
import { UserReferral } from "./userReferral.entity"
import { ReferralRewardTransaction } from "./referralRewardTransaction.entity";
import { BeehiveCategoryMaster } from "./beehiveCategoryMaster.entity"; 
import { BeehivePost } from "./beehivePost.entity"; 
import { BeehivePostMedia } from "./beehivePostMedia.entity"; 
import { BeehivePostTracking } from "./beehivePostTracking.entity"; 
import { BeehiveRewardTransaction } from "./beehiveRewardTransaction.entity"; 
import { BroadcastPost } from "./broadcastPost.entity";
import { BroadcastPostMedia } from "./broadcastPostMedia.entity";
import { BroadcastPostTracking } from "./broadcastPostTracking.entity";
import { BroadcastRewardTransaction } from "./broadcastRewardTransaction.entity";
import { UserNotification } from "./userNotification.entity"
import { ContentMaster } from "./contentMaster.entity";

const entities = [ContentMaster,UserNotification,BroadcastRewardTransaction,BroadcastPostTracking,BroadcastPostMedia,BroadcastPost,State,City,Role,UserDetail,BusinessUserDetail,SubscriptionType,UserSubscription,WidgetMaster,SubscriptionWidgetMap,UserVerification,CardDetail,Settings,EmailTemplate,RewardPointsMaster,UserReferral,ReferralRewardTransaction,StatusMaster,BeehiveCategoryMaster,BeehivePost,BeehivePostMedia,BeehivePostTracking,BeehiveRewardTransaction];

export {ContentMaster,UserNotification,BroadcastRewardTransaction,BroadcastPostTracking,BroadcastPostMedia,BroadcastPost,State,City,Role,UserDetail,BusinessUserDetail,SubscriptionType,UserSubscription,WidgetMaster,SubscriptionWidgetMap,UserVerification,CardDetail,Settings,EmailTemplate,RewardPointsMaster,UserReferral,ReferralRewardTransaction,StatusMaster,BeehiveCategoryMaster,BeehivePost,BeehivePostMedia,BeehivePostTracking,BeehiveRewardTransaction};
export default entities;