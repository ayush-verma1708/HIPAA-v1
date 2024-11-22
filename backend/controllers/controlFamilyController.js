import ControlFamily from '../models/controlFamily.js';
import Control from '../models/control.js';
import Action from '../models/action.js';
import { getNextControlFamilyId } from '../utils/autoIncrementId.js';

// export const getControlFamilies = async (req, res) => {
//   try {
//     const { id } = req.query; // Use query parameter to fetch by ID

//     if (id) {
//       // Fetch single control family by ID
//       const controlFamily = await ControlFamily.findById(id);
//       if (!controlFamily) {
//         return res.status(404).json({ message: 'Control family not found' });
//       }

//       // Fetch controls and actions associated with the control family
//       const controls = await Control.find({
//         control_Family_Id: controlFamily._id,
//       }).lean(); // Using lean() for faster retrieval

//       // Fetch actions for all controls concurrently using a single query
//       const actions = await Action.find({
//         control_Id: { $in: controls.map((control) => control._id) },
//       }).lean(); // Using lean() for faster retrieval

//       // Map actions to controls
//       const actionsMap = actions.reduce((map, action) => {
//         const controlId = action.control_Id.toString();
//         if (!map[controlId]) {
//           map[controlId] = [];
//         }
//         map[controlId].push(action);
//         return map;
//       }, {});

//       // Combine controls with their actions
//       const controlsWithActions = controls.map((control) => ({
//         ...control,
//         actions: actionsMap[control._id] || [], // Use empty array if no actions
//       }));

//       // Return the control family with its controls and actions
//       return res.json({
//         ...controlFamily.toObject(),
//         controls: controlsWithActions,
//       });
//     } else {
//       // Fetch all control families
//       const controlFamilies = await ControlFamily.find().lean(); // Using lean() for faster retrieval

//       // Fetch all controls and actions in bulk
//       const controls = await Control.find().lean();
//       const actions = await Action.find().lean();

//       // Map actions to controls
//       const actionsMap = actions.reduce((map, action) => {
//         const controlId = action.control_Id.toString();
//         if (!map[controlId]) {
//           map[controlId] = [];
//         }
//         map[controlId].push(action);
//         return map;
//       }, {});

//       // Combine controls with their actions and assign them to their respective families
//       const familiesWithControls = controlFamilies.map((family) => {
//         const familyControls = controls.filter((control) =>
//           control.control_Family_Id.equals(family._id)
//         );
//         const controlsWithActions = familyControls.map((control) => ({
//           ...control,
//           actions: actionsMap[control._id] || [], // Use empty array if no actions
//         }));

//         return { ...family, controls: controlsWithActions };
//       });

//       return res.json(familiesWithControls);
//     }
//   } catch (error) {
//     console.error('Error fetching control families:', {
//       message: error.message,
//       stack: error.stack,
//       requestParams: req.query, // Log request parameters for better debugging
//     });
//     return res.status(500).json({ message: 'Error fetching control families' });
//   }
// };

// Fetch control families with controls and actions without using populate
// export const getControlFamilies = async (req, res) => {
//   try {
//     const { id } = req.query; // Use query parameter to fetch by ID

//     if (id) {
//       // Fetch single control family by ID
//       const controlFamily = await ControlFamily.findById(id);
//       if (!controlFamily) {
//         return res.status(404).json({ message: 'Control family not found' });
//       }

//       // Fetch controls associated with the control family
//       const controls = await Control.find({
//         control_Family_Id: controlFamily._id,
//       });
//       // Fetch actions for each control concurrently
//       const actionsPromises = controls.map((control) =>
//         Action.find({ control_Id: control._id })
//       );
//       const actionsArray = await Promise.all(actionsPromises);

//       // Combine controls with their actions
//       const controlsWithActions = controls.map((control, index) => ({
//         ...control._doc,
//         actions: actionsArray[index],
//       }));

//       // Return the control family with its controls and actions
//       return res.json({ ...controlFamily._doc, controls: controlsWithActions });
//     } else {
//       // Fetch all control families
//       const controlFamilies = await ControlFamily.find();
//       const familiesWithControls = await Promise.all(
//         controlFamilies.map(async (family) => {
//           // Fetch controls associated with the family
//           const controls = await Control.find({
//             control_Family_Id: family._id,
//           });
//           // Fetch actions for each control concurrently
//           const actionsPromises = controls.map((control) =>
//             Action.find({ control_Id: control._id })
//           );
//           const actionsArray = await Promise.all(actionsPromises);

//           // Combine controls with their actions
//           const controlsWithActions = controls.map((control, index) => ({
//             ...control._doc,
//             actions: actionsArray[index],
//           }));

//           return { ...family._doc, controls: controlsWithActions };
//         })
//       );

//       return res.json(familiesWithControls);
//     }
//   } catch (error) {
//     console.error('Error fetching control families:', error);
//     return res.status(500).json({ message: 'Error fetching control families' });
//   }
// };

// export const getControlFamilies = async (req, res) => {
//   try {
//     const { id } = req.query; // Use query parameter to fetch by ID
//     if (id) {
//       // Fetch single control family by ID
//       const controlFamily = await ControlFamily.findById(id);
//       if (!controlFamily) {
//         return res.status(404).json({ message: 'Control family not found' });
//       }
//       res.json(controlFamily);
//     } else {
//       // Fetch all control families
//       const controlFamilies = await ControlFamily.find();
//       const result = [];

//       for (const family of controlFamilies) {
//         const controls = await Control.find({ control_Family_Id: family._id });
//         const controlsWithActions = [];

//         for (const control of controls) {
//           const actions = await Action.find({ control_Id: control._id });
//           controlsWithActions.push({ ...control._doc, actions });
//         }

//         result.push({ ...family._doc, controls: controlsWithActions });
//       }

//       res.json(result);
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching control families' });
//   }
// };

// Function to generate the next FixedID

export const getControlFamilies = async (req, res) => {
  try {
    const { id } = req.query; // Use query parameter to fetch by ID

    if (id) {
      // Fetch single control family by ID
      const controlFamily = await ControlFamily.findById(id);
      if (!controlFamily) {
        return res.status(404).json({ message: 'Control family not found' });
      }

      // Fetch controls and actions associated with the control family
      const controls = await Control.find({
        control_Family_Id: controlFamily._id,
      }).lean(); // Using lean() for faster retrieval

      // Fetch actions for all controls concurrently using a single query
      const actions = await Action.find({
        control_Id: { $in: controls.map((control) => control._id) },
      }).lean();

      // Map actions to controls
      const actionsMap = actions.reduce((map, action) => {
        const controlId = action.control_Id.toString();
        if (!map[controlId]) {
          map[controlId] = [];
        }
        map[controlId].push(action);
        return map;
      }, {});

      // Combine controls with their actions
      const controlsWithActions = controls.map((control) => ({
        ...control,
        actions: actionsMap[control._id] || [], // Use empty array if no actions
      }));

      // Return the control family with its controls and actions
      return res.json({
        ...controlFamily.toObject(),
        controls: controlsWithActions,
      });
    } else {
      // Fetch all control families
      const controlFamilies = await ControlFamily.find().lean(); // Using lean() for faster retrieval

      // Fetch all controls and actions in bulk
      const controls = await Control.find().lean();
      const actions = await Action.find().lean();

      // Map actions to controls
      const actionsMap = actions.reduce((map, action) => {
        const controlId = action.control_Id.toString();
        if (!map[controlId]) {
          map[controlId] = [];
        }
        map[controlId].push(action);
        return map;
      }, {});

      // Combine controls with their actions and assign them to their respective families
      const familiesWithControls = controlFamilies.map((family) => {
        const familyControls = controls.filter(
          (control) =>
            control.control_Family_Id &&
            control.control_Family_Id.equals(family._id) // Check if control_Family_Id is defined
        );

        const controlsWithActions = familyControls.map((control) => ({
          ...control,
          actions: actionsMap[control._id] || [], // Use empty array if no actions
        }));

        return { ...family, controls: controlsWithActions };
      });

      return res.json(familiesWithControls);
    }
  } catch (error) {
    console.error('Error fetching control families:', {
      message: error.message,
      stack: error.stack,
      requestParams: req.query, // Log request parameters for better debugging
    });
    return res.status(500).json({ message: 'Error fetching control families' });
  }
};

const generateNextFixedID = async () => {
  try {
    const lastControlFamily = await ControlFamily.findOne()
      .sort({ fixed_id: -1 })
      .limit(1);
    if (lastControlFamily && lastControlFamily.fixed_id) {
      const lastFixedID = lastControlFamily.fixed_id;
      const numericPart = parseInt(lastFixedID.replace('CF', ''));
      return `CF${(numericPart + 1).toString().padStart(2, '0')}`;
    }
    return 'CF01';
  } catch (error) {
    console.error('Error generating FixedID:', error);
    throw new Error('Failed to generate FixedID');
  }
};

export const createControlFamily = async (req, res) => {
  try {
    const FixedID = await generateNextFixedID();
    const controlFamily = new ControlFamily({
      fixed_id: FixedID,
      variable_id: req.body.variable_id,
    });

    await controlFamily.save();
    res.status(201).json(controlFamily);
  } catch (error) {
    console.error('Error details:', error);
    res
      .status(400)
      .json({ message: 'Error creating control family', error: error.message });
  }
};

export const updateControlFamily = async (req, res) => {
  try {
    const { id } = req.params;

    const controlFamily = await ControlFamily.findById(id);
    if (!controlFamily) {
      return res.status(404).json({ message: 'Control family not found' });
    }

    if (controlFamily.isDPDPA) {
      return res.status(403).json({
        message: 'Cannot edit a control family with isDPDPA set to 1',
      });
    }

    const updatedControlFamily = await ControlFamily.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (updatedControlFamily) {
      // await updateControlFamilyInfo(id);
      res.json(updatedControlFamily);
    } else {
      res.status(404).json({ message: 'Control family not found' });
    }
  } catch (error) {
    console.error(
      'Error updating control family:',
      error.message,
      error.stack,
      error.name,
      error.code
    );
    res
      .status(400)
      .json({ message: 'Error updating control family', error: error.message });
  }
};

export const deleteControlFamily = async (req, res) => {
  try {
    const { id } = req.params;

    const controlFamily = await ControlFamily.findById(id);
    if (!controlFamily) {
      return res.status(404).json({ message: 'Control family not found' });
    }

    if (controlFamily.isDPDPA) {
      return res.status(403).json({
        message: 'Cannot delete a control family with isDPDPA set to 1',
      });
    }

    await Control.deleteMany({ control_Family_Id: id });
    await Action.deleteMany({
      control_Id: {
        $in: (await Control.find({ control_Family_Id: id })).map((c) => c._id),
      },
    });

    await ControlFamily.findByIdAndDelete(id);

    res.json({
      message:
        'Control family and related controls and actions deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting control family' });
  }
};
