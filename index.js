'use strct'

var file2json = require('./file2json'),
    json2file = require('./json2file'),

    hasMajorMinorPatch = require('./hasMajorMinorPatch'),
    hasVersion         = require('./hasVersion'),

    getVersion = require('./getVersion')

var versiony = (function(){

    var source,
        sourceJson,
        version2json = function(model, json){

            var value = model.get()

            if (hasMajorMinorPatch(json)){
                json.major = value[0]
                json.minor = value[1]
                json.patch = value[2]
            } else if (hasVersion(json)){
                json.version = value.join('.')
            }

            return json
        },

        logStrip = function(){
            console.log('---------------------------------------------')
        }

    return {
        model: require('./model')(),

        version: function(version){

            this.model.reset()
            this.model.set(getVersion(version))

            return this
        },

        newMajor: function(){
            this.major()
            this.minor(0)
            this.patch(0)

            return this
        },

        newMinor: function(){
            return this.minor().patch(0)
        },

        major: function(major){

            this.model.major.apply(this.model, arguments)

            return this
        },

        minor: function(minor){
            this.model.minor.apply(this.model, arguments)

            return this
        },

        patch: function(patch){
            this.model.patch.apply(this.model, arguments)

            return this
        },

        from: function(s){
            source = s

            try {
                sourceJson = file2json(source)
            } catch (ex){
                console.log('Could not read source file "' + source + '"! ')
                console.log(ex)

                return this
            }

            var version = getVersion(sourceJson)

            if (!version){
                console.warn('Version could not be detected from "' + s + '"! Please either ' +
                             'use a "version" key, with a semver string (eg: "1.2.3") or ' +
                             'use "major", "minor" and "patch" keys to specify each semver part separately.'
                             )
                return this
            }

            this.model.set(version)
            this.initial = String(this.model)

            return this
        },

        'with': function(file){
            return this.from(file).to()
        },

        to: function(file){
            if (!file){
                file = source
            }

            if (file == source && String(this.model.get()) == this.initial ){
                //skip same file, no change detected
                return this
            }

            if (!file){
                return this
            }

            var json

            try {
                json = file2json(file)
            } catch (ex){
                console.log('\nNo file found at "'+ file + '". Skipping. \n')
                return this
            }

            try {
                if (!this.model.hasFile(file)){

                    this.model.file(file)

                    json2file(
                        file,
                        version2json(this.model, json)
                    )
                }
            } catch (ex){
                console.log('\nCould not write version to "' + file + '". Skipping. \n')
            }

            return this
        },

        end: function(){

            logStrip()
            var files = this.model.files()

            if (files.length){


                console.log('Done. New version: ' + String(this.model.get()))
                logStrip()

                console.log('Files updated:\n')

                files.forEach(function(f){
                    console.log(f)
                })


            } else {
                console.log('No file updated.')
            }

            logStrip()

            this.model.reset()



        }
    }
})()

module.exports = versiony