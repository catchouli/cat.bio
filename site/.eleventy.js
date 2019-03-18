module.exports = function(eleventyConfig) {
  eleventyConfig.setTemplateFormats("html,njk,png,css")

  eleventyConfig.addFilter("formatDate", function(date) {
    return date.toLocaleDateString(undefined, {day:"2-digit",month:"2-digit",year:"numeric"})
  })
}
