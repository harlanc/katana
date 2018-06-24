
const path = require('path')
const qiniu = require('qiniu')

let _qiniuService
module.exports = class {
  static set qiniuService (val) {
    _qiniuService = val
  }

  static upload (file, callback) {
    console.log('Uploading image to qiniu...%j', _qiniuService)
    console.log('Uploading image to qiniu...', file)

    const ak = _qiniuService.accessKey
    const sk = _qiniuService.secretKey
    const sc = _qiniuService.Scope
    const dm = _qiniuService.defaultDomain

    var key = path.basename(file)
    const link = {link: path.join(dm, key)}

    var mac = new qiniu.auth.digest.Mac(ak, sk)
    var options = {
      scope: sc + ':' + key,
      expires: 0
    }
    var putPolicy = new qiniu.rs.PutPolicy(options)
    var uploadToken = putPolicy.uploadToken(mac)
    var config = new qiniu.conf.Config()

    config.zone = qiniu.zone.Zone_z1
    var formUploader = new qiniu.form_up.FormUploader(config)
    var putExtra = new qiniu.form_up.PutExtra()

    formUploader.putFile(uploadToken, key, file, putExtra, function ( respErr, respBody, respInfo) {
      console.log('status:' + respInfo.statusCode)
      if (respErr) {
        callback(null, respErr)
        throw respErr
      }
      if (respInfo.statusCode === 200) {
        callback(link)
        console.log(respBody)
      } else {
        console.log(respInfo.statusCode)
        console.log(respBody)
        //callback(link)
      }
    })
  }
}
