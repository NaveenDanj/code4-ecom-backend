import bcrypt from 'bcryptjs'

export default {

    hashPasswod(password:string) {

        return new Promise((resolve, reject) => {
          bcrypt.genSalt(10, function (err: any, salt: any) {
            if (err) {
              reject(err);
            }
            bcrypt.hash(password, salt, async function (err:any, hash:string) {
              if (err) {
                reject(err);
              }
              resolve(hash);
            });
          });
        });
    },

    comparePassword(password:string, hash:string) {
        return new Promise((resolve, reject) => {
          bcrypt.compare(password, hash, function (err, isMatch) {
            if (err) {
              reject(err);
            }
            resolve(isMatch);
          });
        });
    },

}