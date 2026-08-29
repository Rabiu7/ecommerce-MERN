const Category = require("../models/Category");

const cloudinary = require("../config/cloudinary");

// =========================================================
// GET ALL CATEGORIES
// =========================================================

exports.getCategories = (req, res) => {
  Category.getAll((err, result) => {
    if (err) {
      console.error(
        "Get categories error:",
        err,
      );

      return res.status(500).json({
        message: "Failed to fetch categories",
        error: err.message,
      });
    }

    res.json(result);
  });
};

// =========================================================
// GET SINGLE CATEGORY
// =========================================================

exports.getCategoryById = (req, res) => {
  const id = req.params.id;

  Category.getById(id, (err, result) => {
    if (err) {
      console.error(
        "Get category error:",
        err,
      );

      return res.status(500).json({
        message: "Failed to fetch category",
        error: err.message,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json(result[0]);
  });
};

// =========================================================
// CREATE CATEGORY
// =========================================================

exports.createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
    } = req.body;

    // Validate name

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required.",
      });
    }

    // Validate image

    if (!req.file) {
      return res.status(400).json({
        message: "Category image is required.",
      });
    }

    // Upload image to Cloudinary

    const result =
      await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: "categories",
        },
      );

    // Category object

    const category = {
      name: name.trim(),
      description:
        description?.trim() || null,
      image: result.secure_url,
    };

    // Save to MySQL

    Category.create(
      category,
      (err, dbResult) => {
        if (err) {
          console.error(
            "Database error:",
            err,
          );

          return res.status(500).json({
            message:
              "Category creation failed",
            error: err.message,
          });
        }

        res.status(201).json({
          message:
            "Category created successfully",
          id: dbResult.insertId,
          image: result.secure_url,
        });
      },
    );
  } catch (error) {
    console.error(
      "Category creation error:",
      error,
    );

    res.status(500).json({
      message:
        "Category creation failed",
      error: error.message,
    });
  }
};

// =========================================================
// UPDATE CATEGORY
// =========================================================

exports.updateCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      name,
      description,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message:
          "Category name is required.",
      });
    }

    // Get existing category

    Category.getById(
      id,
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            message:
              "Failed to fetch category",
            error: err.message,
          });
        }

        if (result.length === 0) {
          return res.status(404).json({
            message:
              "Category not found",
          });
        }

        try {
          // Keep old image

          let image = result[0].image;

          // If new image selected,
          // upload it to Cloudinary

          if (req.file) {
            const cloudinaryResult =
              await cloudinary.uploader.upload(
                req.file.path,
                {
                  folder: "categories",
                },
              );

            image =
              cloudinaryResult.secure_url;
          }

          const category = {
            name: name.trim(),
            description:
              description?.trim() || null,
            image,
          };

          Category.update(
            id,
            category,
            (updateErr) => {
              if (updateErr) {
                console.error(
                  "Update category DB error:",
                  updateErr,
                );

                return res.status(500).json({
                  message:
                    "Category update failed",
                  error:
                    updateErr.message,
                });
              }

              res.json({
                message:
                  "Category updated successfully",
                image,
              });
            },
          );
        } catch (uploadError) {
          console.error(
            "Category image upload error:",
            uploadError,
          );

          return res.status(500).json({
            message:
              "Category image upload failed",
            error:
              uploadError.message,
          });
        }
      },
    );
  } catch (error) {
    console.error(
      "Category update error:",
      error,
    );

    res.status(500).json({
      message:
        "Category update failed",
      error: error.message,
    });
  }
};

// =========================================================
// DELETE CATEGORY
// =========================================================

exports.deleteCategory = (req, res) => {
  const id = req.params.id;

  // Check if category exists

  Category.getById(
    id,
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message:
            "Failed to fetch category",
          error: err.message,
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          message:
            "Category not found",
        });
      }

      // Check products

      Category.getProductCount(
        id,
        (countErr, countResult) => {
          if (countErr) {
            return res.status(500).json({
              message:
                "Failed to check products",
              error:
                countErr.message,
            });
          }

          if (
            Number(countResult[0].count) > 0
          ) {
            return res.status(400).json({
              message:
                "Cannot delete category because products are assigned to it.",
            });
          }

          // Delete category

          Category.delete(
            id,
            (deleteErr) => {
              if (deleteErr) {
                return res.status(500).json({
                  message:
                    "Category deletion failed",
                  error:
                    deleteErr.message,
                });
              }

              res.json({
                message:
                  "Category deleted successfully",
              });
            },
          );
        },
      );
    },
  );
};