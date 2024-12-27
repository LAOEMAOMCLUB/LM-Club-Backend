import local from "./../config/env/local";
import dev from "./../config/env/dev";
import uat from "./../config/env/uat";
import prod from "./../config/env/production";

let environmentConfig;

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "prod";
    environmentConfig = prod;
} else if (process.env.NODE_ENV === "dev") {
    environmentConfig = dev;
} else if (process.env.NODE_ENV === "uat") {
    environmentConfig = uat;
} else if (process.env.NODE_ENV === "prod") {
    environmentConfig = prod;
} else {
    environmentConfig = prod;
}
console.log('process.env.NODE_ENV', process.env.NODE_ENV)
export default environmentConfig;