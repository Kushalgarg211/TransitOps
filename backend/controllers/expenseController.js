const { Expense, Vehicle } = require('../models');

const getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['id', 'registration_number', 'vehicle_name'] }],
    });
    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id, {
      include: [{ model: Vehicle, as: 'vehicle' }],
    });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }
    return res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const { vehicle_id, expense_type, amount, description, date } = req.body;

    const vehicle = await Vehicle.findByPk(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const expense = await Expense.create({
      vehicle_id,
      expense_type,
      amount,
      description,
      date,
    });

    return res.status(201).json({
      success: true,
      message: 'Expense recorded successfully.',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    const { vehicle_id } = req.body;
    if (vehicle_id) {
      const vehicle = await Vehicle.findByPk(vehicle_id);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found.' });
      }
    }

    await expense.update(req.body);
    return res.status(200).json({
      success: true,
      message: 'Expense record updated.',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    await expense.destroy();
    return res.status(200).json({
      success: true,
      message: 'Expense record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};
