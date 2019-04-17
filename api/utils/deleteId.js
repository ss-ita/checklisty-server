const deleteId = (sections) => {
  const newSections = [];
  sections.map(section => {
    section = section.toObject()
    delete section._id;
    section.items_data.map(item => {
      delete item._id;
      return item
    });
    newSections.push(section);
  });

  return newSections
};

module.exports = { deleteId };
