import * as comboService from "./../services/combo.service.js"

export async function getCombos(req, res, next) {
    try {
        const combos = await comboService.listarCombos()
        res.json({ combos })
    } catch (error) {
        next(error)
    }
}